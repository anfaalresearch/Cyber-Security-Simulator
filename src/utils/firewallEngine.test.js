import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ipToLong,
  isIpInCidr,
  isPortMatch,
  isProtocolMatch,
  inspectPayload,
  StatefulTable,
  evaluatePacket,
  runDefenseScenario,
  DEFENSE_CHALLENGES
} from './firewallEngine.js';

test('CIDR calculation and IP matching', () => {
  assert.equal(ipToLong('192.168.1.1'), 3232235777);
  assert.equal(ipToLong('invalid.ip'), null);
  assert.equal(ipToLong('256.0.0.1'), null);

  // Wildcards and ANY
  assert.equal(isIpInCidr('10.0.0.1', '*'), true);
  assert.equal(isIpInCidr('10.0.0.1', '0.0.0.0/0'), true);

  // Subnet checks
  assert.equal(isIpInCidr('192.168.1.55', '192.168.1.0/24'), true);
  assert.equal(isIpInCidr('192.168.2.1', '192.168.1.0/24'), false);
  assert.equal(isIpInCidr('10.254.12.3', '10.0.0.0/8'), true);
  assert.equal(isIpInCidr('172.16.0.5', '10.0.0.0/8'), false);

  // Single IP exact match
  assert.equal(isIpInCidr('1.1.1.1', '1.1.1.1'), true);
  assert.equal(isIpInCidr('1.1.1.2', '1.1.1.1'), false);
});

test('Port matching supports single, comma-separated, and ranges', () => {
  assert.equal(isPortMatch(80, '*'), true);
  assert.equal(isPortMatch(80, '80'), true);
  assert.equal(isPortMatch(81, '80'), false);
  assert.equal(isPortMatch(443, '80,443'), true);
  assert.equal(isPortMatch(8080, '80,443'), false);
  assert.equal(isPortMatch(5000, '1024-65535'), true);
  assert.equal(isPortMatch(22, '1024-65535'), false);
  assert.equal(isPortMatch(0, '80'), false);
});

test('Protocol matching handles wildcards and case variations', () => {
  assert.equal(isProtocolMatch('tcp', 'TCP'), true);
  assert.equal(isProtocolMatch('UDP', 'udp'), true);
  assert.equal(isProtocolMatch('ICMP', 'all'), true);
  assert.equal(isProtocolMatch('TCP', 'UDP'), false);
});

test('Deep Packet Inspection flags SQLi, XSS, and command injection signatures', () => {
  const sqli = inspectPayload("SELECT * FROM users WHERE user = 'admin' OR 1=1 --");
  assert.equal(sqli.isMalicious, true);
  assert.ok(sqli.matches.includes('SQL Injection'));

  const xss = inspectPayload("<script>alert('pwned')</script>");
  assert.equal(xss.isMalicious, true);
  assert.ok(xss.matches.includes('Cross-Site Scripting (XSS)'));

  const clean = inspectPayload("Hello world, this is a clean blog post title.");
  assert.equal(clean.isMalicious, false);
  assert.equal(clean.matches.length, 0);
});

test('Stateful connection tracking follows 3-way handshake and validates return traffic', () => {
  const table = new StatefulTable();

  // Outbound SYN
  const syn = { srcIp: '192.168.1.10', dstIp: '1.1.1.1', srcPort: 54000, dstPort: 443, protocol: 'TCP', tcpFlags: ['SYN'] };
  const r1 = table.processPacket(syn);
  assert.equal(r1.state, 'SYN_SENT');

  // Inbound SYN-ACK (Return traffic)
  const synAck = { srcIp: '1.1.1.1', dstIp: '192.168.1.10', srcPort: 443, dstPort: 54000, protocol: 'TCP', tcpFlags: ['SYN', 'ACK'] };
  const r2 = table.processPacket(synAck);
  assert.equal(r2.state, 'SYN_RECV');
  assert.equal(r2.isReturnTraffic, true);

  // Outbound ACK completing handshake
  const ack = { srcIp: '192.168.1.10', dstIp: '1.1.1.1', srcPort: 54000, dstPort: 443, protocol: 'TCP', tcpFlags: ['ACK'] };
  const r3 = table.processPacket(ack);
  assert.equal(r3.state, 'ESTABLISHED');
});

test('Evaluates packet against ordered priority rules and DPI', () => {
  const rules = [
    { id: 'block-sqli', priority: 1, action: 'DROP', protocol: 'TCP', srcCidr: '*', dstCidr: '*', dstPort: '80,443', dpiFilter: true, name: 'DPI Filter' },
    { id: 'allow-web', priority: 10, action: 'ALLOW', protocol: 'TCP', srcCidr: '*', dstCidr: '*', dstPort: '80,443', name: 'Allow Web' }
  ];

  const cleanPacket = {
    srcIp: '10.0.0.1',
    dstIp: '192.168.1.5',
    protocol: 'TCP',
    dstPort: 80,
    payload: 'GET /index.html'
  };

  const outcomeClean = evaluatePacket(cleanPacket, rules);
  assert.equal(outcomeClean.action, 'ALLOW');
  assert.equal(outcomeClean.ruleId, 'allow-web');

  const dirtyPacket = {
    srcIp: '10.0.0.1',
    dstIp: '192.168.1.5',
    protocol: 'TCP',
    dstPort: 80,
    payload: 'GET /users?id=1 UNION SELECT username,password FROM accounts'
  };

  const outcomeDirty = evaluatePacket(dirtyPacket, rules);
  assert.equal(outcomeDirty.action, 'DROP');
  assert.ok(outcomeDirty.reason.includes('DPI Triggered'));
});

test('Defense challenge scenario runs and calculates scoring metrics', () => {
  const challenge = DEFENSE_CHALLENGES[0];
  const rules = [
    { id: 'block-attacker', priority: 5, action: 'DROP', protocol: 'TCP', srcCidr: '203.0.113.0/24', dstCidr: '*', dstPort: '*', name: 'Block Attacker Subnet' },
    { id: 'allow-clients', priority: 20, action: 'ALLOW', protocol: 'TCP', srcCidr: '192.168.1.0/24', dstCidr: '10.0.0.5', dstPort: '80,443', name: 'Allow Internal Web Clients' }
  ];

  const result = runDefenseScenario(challenge, rules);
  assert.equal(result.maliciousBlocked, result.totalMalicious);
  assert.equal(result.legitimateAllowed, result.totalLegitimate);
  assert.equal(result.score, 100);
  assert.equal(result.passed, true);
  assert.equal(result.xpAwarded, challenge.xpReward);
});
