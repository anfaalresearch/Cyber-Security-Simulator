// Firewall & Packet Inspection Engine
// Supports CIDR matching, port ranges, stateful connection tracking, DPI signature detection, and attack evaluation.

export const KNOWN_DPI_SIGNATURES = [
  { id: 'sqli', name: 'SQL Injection', pattern: /(\b(UNION\s+SELECT|DROP\s+TABLE|OR\s+1\s*=\s*1|SELECT\s+.*FROM|INSERT\s+INTO)\b|--\s*$|;\s*SHUTDOWN)/i },
  { id: 'xss', name: 'Cross-Site Scripting (XSS)', pattern: /(<script[\s>].*?<\/script>|javascript:|onerror\s*=|onload\s*=|alert\(.*?\))/i },
  { id: 'path_traversal', name: 'Path Traversal', pattern: /(\.\.\/|\.\.\\|\/etc\/passwd|c:\\windows\\system32)/i },
  { id: 'cmd_injection', name: 'Command Injection', pattern: /(;\s*(rm\s+-rf|cat\s+\/|bash\s+-i|nc\s+-e|powershell|cmd\.exe)|`.*?`|\$\(.*?\))/i },
  { id: 'credential_exfil', name: 'Data Exfiltration / Leak', pattern: /(CONFIDENTIAL|PRIVATE KEY|BEGIN RSA PRIVATE|AWS_SECRET_ACCESS_KEY)/i }
];

export function ipToLong(ip) {
  if (typeof ip !== 'string') return null;
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return null;
  let num = 0;
  for (let i = 0; i < 4; i++) {
    const octet = Number(parts[i]);
    if (isNaN(octet) || octet < 0 || octet > 255 || parts[i].trim() !== String(octet)) {
      return null;
    }
    num = (num << 8) + octet;
  }
  return num >>> 0;
}

export function isIpInCidr(ip, cidr) {
  if (!cidr || cidr === '*' || cidr === 'ANY' || cidr === 'any' || cidr === '0.0.0.0/0') {
    return true;
  }
  const target = ipToLong(ip);
  if (target === null) return false;

  const [cidrIp, prefixStr] = cidr.trim().split('/');
  const base = ipToLong(cidrIp);
  if (base === null) return false;

  const prefix = prefixStr !== undefined ? Number(prefixStr) : 32;
  if (isNaN(prefix) || prefix < 0 || prefix > 32) return false;

  if (prefix === 0) return true;
  const mask = prefix === 32 ? 0xffffffff : (~((1 << (32 - prefix)) - 1)) >>> 0;
  return (target & mask) === (base & mask);
}

export function isPortMatch(port, portPattern) {
  if (!portPattern || portPattern === '*' || portPattern === 'ANY' || portPattern === 'any') {
    return true;
  }
  const p = Number(port);
  if (isNaN(p) || p < 1 || p > 65535) return false;

  const segments = String(portPattern).split(',').map((s) => s.trim());
  for (const seg of segments) {
    if (seg.includes('-')) {
      const [startStr, endStr] = seg.split('-').map((s) => Number(s.trim()));
      if (!isNaN(startStr) && !isNaN(endStr) && p >= startStr && p <= endStr) {
        return true;
      }
    } else {
      if (Number(seg) === p) return true;
    }
  }
  return false;
}

export function isProtocolMatch(packetProto, ruleProto) {
  if (!ruleProto || ruleProto === '*' || ruleProto === 'ALL' || ruleProto === 'all') {
    return true;
  }
  return String(packetProto).toUpperCase() === String(ruleProto).toUpperCase();
}

export function inspectPayload(payload) {
  if (!payload || typeof payload !== 'string') {
    return { isMalicious: false, matches: [] };
  }
  const matches = [];
  for (const sig of KNOWN_DPI_SIGNATURES) {
    if (sig.pattern.test(payload)) {
      matches.push(sig);
    }
  }
  return {
    isMalicious: matches.length > 0,
    matches: matches.map((m) => m.name)
  };
}

export class StatefulTable {
  constructor() {
    this.connections = new Map();
  }

  getKey(srcIp, dstIp, srcPort, dstPort, protocol) {
    return `${protocol}:${srcIp}:${srcPort}->${dstIp}:${dstPort}`;
  }

  getReverseKey(srcIp, dstIp, srcPort, dstPort, protocol) {
    return `${protocol}:${dstIp}:${dstPort}->${srcIp}:${srcPort}`;
  }

  processPacket(packet) {
    const { srcIp, dstIp, srcPort, dstPort, protocol, tcpFlags = [] } = packet;
    if (protocol !== 'TCP') {
      return { isTracked: false, state: 'N/A' };
    }

    const key = this.getKey(srcIp, dstIp, srcPort, dstPort, protocol);
    const revKey = this.getReverseKey(srcIp, dstIp, srcPort, dstPort, protocol);

    const isSyn = tcpFlags.includes('SYN');
    const isAck = tcpFlags.includes('ACK');
    const isFin = tcpFlags.includes('FIN');
    const isRst = tcpFlags.includes('RST');

    if (isRst) {
      this.connections.delete(key);
      this.connections.delete(revKey);
      return { isTracked: true, state: 'CLOSED', isReturnTraffic: false };
    }

    if (this.connections.has(revKey)) {
      // Return traffic from existing connection!
      if (isFin) {
        this.connections.set(revKey, 'FIN_WAIT');
        return { isTracked: true, state: 'FIN_WAIT', isReturnTraffic: true };
      }
      if (isSyn && isAck) {
        this.connections.set(revKey, 'SYN_RECV');
        return { isTracked: true, state: 'SYN_RECV', isReturnTraffic: true };
      }
      this.connections.set(revKey, 'ESTABLISHED');
      return { isTracked: true, state: 'ESTABLISHED', isReturnTraffic: true };
    }

    if (this.connections.has(key)) {
      const current = this.connections.get(key);
      if (isFin) {
        this.connections.set(key, 'CLOSED');
        return { isTracked: true, state: 'CLOSED', isReturnTraffic: false };
      }
      if (current === 'SYN_RECV' && isAck) {
        this.connections.set(key, 'ESTABLISHED');
        return { isTracked: true, state: 'ESTABLISHED', isReturnTraffic: false };
      }
      return { isTracked: true, state: current, isReturnTraffic: false };
    }

    if (isSyn && !isAck) {
      this.connections.set(key, 'SYN_SENT');
      return { isTracked: true, state: 'SYN_SENT', isReturnTraffic: false };
    }

    return { isTracked: false, state: 'INVALID_NEW', isReturnTraffic: false };
  }

  reset() {
    this.connections.clear();
  }
}

export function evaluatePacket(packet, rules = [], stateTable = null, defaultAction = 'DROP') {
  let stateInfo = { isTracked: false, state: 'STATELESS', isReturnTraffic: false };
  if (stateTable && packet.protocol === 'TCP') {
    stateInfo = stateTable.processPacket(packet);
    // Automatically permit established return traffic if stateful inspection is active
    if (stateInfo.isReturnTraffic && (stateInfo.state === 'ESTABLISHED' || stateInfo.state === 'SYN_RECV')) {
      return {
        action: 'ALLOW',
        ruleId: 'STATEFUL_AUTO_ALLOW',
        reason: `Stateful inspection: validated established return traffic (${stateInfo.state})`,
        matchedRule: null,
        dpi: inspectPayload(packet.payload),
        state: stateInfo.state
      };
    }
  }

  const dpiResult = inspectPayload(packet.payload);

  // Evaluate user rules sorted by priority (lowest priority number = evaluated first)
  const sortedRules = [...rules].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));

  for (const rule of sortedRules) {
    if (rule.enabled === false) continue;

    // Check protocol match
    if (!isProtocolMatch(packet.protocol, rule.protocol)) continue;

    // Check source & destination CIDR
    if (!isIpInCidr(packet.srcIp, rule.srcCidr)) continue;
    if (!isIpInCidr(packet.dstIp, rule.dstCidr)) continue;

    // Check ports
    if (packet.dstPort && !isPortMatch(packet.dstPort, rule.dstPort)) continue;
    if (rule.srcPort && packet.srcPort && !isPortMatch(packet.srcPort, rule.srcPort)) continue;

    // Optional DPI inspection requirement on rule
    if (rule.dpiFilter) {
      if (!dpiResult.isMalicious) {
        // Payload is clean, so this DPI inspection rule does not trigger; continue to next rule
        continue;
      }
      return {
        action: rule.action ? rule.action.toUpperCase() : 'DROP',
        ruleId: rule.id || 'DPI_INTERCEPT',
        reason: `DPI Triggered on rule "${rule.name || rule.id}": Detected ${dpiResult.matches.join(', ')}`,
        matchedRule: rule,
        dpi: dpiResult,
        state: stateInfo.state
      };
    }

    // If an allow rule specifically requires clean DPI and payload is dirty, drop it immediately
    if (rule.action.toUpperCase() === 'ALLOW' && rule.requireDpiClean && dpiResult.isMalicious) {
      return {
        action: 'DROP',
        ruleId: 'DPI_DISQUALIFIED',
        reason: `DPI Quarantine: Disallowed traffic matching rule "${rule.name || rule.id}" due to detected ${dpiResult.matches.join(', ')}`,
        matchedRule: rule,
        dpi: dpiResult,
        state: stateInfo.state
      };
    }

    return {
      action: rule.action.toUpperCase(),
      ruleId: rule.id,
      reason: `Matched rule [${rule.priority || 0}] ${rule.name || rule.action}: ${rule.description || 'ACL match'}`,
      matchedRule: rule,
      dpi: dpiResult,
      state: stateInfo.state
    };
  }

  // Fallback default policy
  return {
    action: defaultAction.toUpperCase(),
    ruleId: 'DEFAULT_POLICY',
    reason: `No matching rule. Default firewall policy [${defaultAction}] applied.`,
    matchedRule: null,
    dpi: dpiResult,
    state: stateInfo.state
  };
}

export const DEFENSE_CHALLENGES = [
  {
    id: 'syn-flood-mitigation',
    title: 'SYN Flood Mitigation',
    difficulty: 'Medium',
    targetScore: 80,
    xpReward: 60,
    description: 'An attacker from subnet 203.0.113.0/24 is flooding your web server (10.0.0.5) with TCP SYN packets. Write rules to block the attacker subnet while keeping port 80/443 open for legitimate clients (192.168.1.0/24).',
    initialRules: [
      { id: 'allow-web-all', priority: 10, action: 'ALLOW', protocol: 'TCP', srcCidr: '*', dstCidr: '10.0.0.5/32', dstPort: '80,443', name: 'Allow All Web Traffic', requireDpiClean: false }
    ],
    testPackets: [
      { id: 'syn-1', srcIp: '203.0.113.15', dstIp: '10.0.0.5', protocol: 'TCP', srcPort: 49152, dstPort: 80, tcpFlags: ['SYN'], payload: '', isMalicious: true },
      { id: 'syn-2', srcIp: '203.0.113.44', dstIp: '10.0.0.5', protocol: 'TCP', srcPort: 49153, dstPort: 80, tcpFlags: ['SYN'], payload: '', isMalicious: true },
      { id: 'syn-3', srcIp: '203.0.113.99', dstIp: '10.0.0.5', protocol: 'TCP', srcPort: 49154, dstPort: 443, tcpFlags: ['SYN'], payload: '', isMalicious: true },
      { id: 'legit-1', srcIp: '192.168.1.50', dstIp: '10.0.0.5', protocol: 'TCP', srcPort: 52100, dstPort: 443, tcpFlags: ['SYN'], payload: '', isMalicious: false },
      { id: 'legit-2', srcIp: '192.168.1.75', dstIp: '10.0.0.5', protocol: 'TCP', srcPort: 52101, dstPort: 80, tcpFlags: ['SYN'], payload: '', isMalicious: false }
    ]
  },
  {
    id: 'sqli-dpi-defense',
    title: 'Deep Packet Inspection: SQL Injection Intercept',
    difficulty: 'Hard',
    targetScore: 90,
    xpReward: 80,
    description: 'Threat actors are sending malicious SQL injection payloads to your REST API at 10.0.0.8:443. Enable DPI inspection rules to block payloads containing SQL injections while allowing normal customer API requests.',
    initialRules: [
      { id: 'allow-api', priority: 20, action: 'ALLOW', protocol: 'TCP', srcCidr: '*', dstCidr: '10.0.0.8/32', dstPort: '443', name: 'Allow API', requireDpiClean: false }
    ],
    testPackets: [
      { id: 'sqli-1', srcIp: '198.51.100.12', dstIp: '10.0.0.8', protocol: 'TCP', srcPort: 33120, dstPort: 443, tcpFlags: ['PSH', 'ACK'], payload: 'GET /api/user?id=1 UNION SELECT username,password FROM users --', isMalicious: true },
      { id: 'sqli-2', srcIp: '198.51.100.33', dstIp: '10.0.0.8', protocol: 'TCP', srcPort: 33121, dstPort: 443, tcpFlags: ['PSH', 'ACK'], payload: 'POST /api/login HTTP/1.1 {"user": "admin\' OR 1=1 --"}', isMalicious: true },
      { id: 'legit-api-1', srcIp: '172.16.5.20', dstIp: '10.0.0.8', protocol: 'TCP', srcPort: 44100, dstPort: 443, tcpFlags: ['PSH', 'ACK'], payload: 'GET /api/products?category=electronics', isMalicious: false },
      { id: 'legit-api-2', srcIp: '172.16.5.21', dstIp: '10.0.0.8', protocol: 'TCP', srcPort: 44101, dstPort: 443, tcpFlags: ['PSH', 'ACK'], payload: 'POST /api/cart {"item_id": 402, "qty": 1}', isMalicious: false }
    ]
  },
  {
    id: 'bastion-ssh-hardening',
    title: 'Bastion Subnet Hardening (Port 22)',
    difficulty: 'Medium',
    targetScore: 85,
    xpReward: 50,
    description: 'Lock down SSH access (port 22) across the corporate data center. Only administrators connecting from the internal Operations subnet (10.10.100.0/24) should be allowed. All other SSH attempts must be dropped.',
    initialRules: [
      { id: 'open-ssh', priority: 50, action: 'ALLOW', protocol: 'TCP', srcCidr: '*', dstCidr: '*', dstPort: '22', name: 'Open SSH Access', requireDpiClean: false }
    ],
    testPackets: [
      { id: 'ssh-ext-1', srcIp: '185.220.101.5', dstIp: '10.0.0.2', protocol: 'TCP', srcPort: 55432, dstPort: 22, tcpFlags: ['SYN'], payload: 'SSH-2.0-OpenSSH_8.9', isMalicious: true },
      { id: 'ssh-ext-2', srcIp: '45.155.205.233', dstIp: '10.0.0.3', protocol: 'TCP', srcPort: 55433, dstPort: 22, tcpFlags: ['SYN'], payload: 'SSH-2.0-libssh_0.9', isMalicious: true },
      { id: 'ssh-admin', srcIp: '10.10.100.45', dstIp: '10.0.0.2', protocol: 'TCP', srcPort: 60100, dstPort: 22, tcpFlags: ['SYN'], payload: 'SSH-2.0-OpenSSH_9.3', isMalicious: false }
    ]
  }
];

export function runDefenseScenario(challenge, rules) {
  const stateTable = new StatefulTable();
  const results = [];
  let maliciousBlocked = 0;
  let totalMalicious = 0;
  let legitimateAllowed = 0;
  let totalLegitimate = 0;

  for (const packet of challenge.testPackets) {
    const outcome = evaluatePacket(packet, rules, stateTable, 'DROP');
    const wasBlocked = outcome.action === 'DROP' || outcome.action === 'DENY';
    const wasAllowed = outcome.action === 'ALLOW';

    if (packet.isMalicious) {
      totalMalicious++;
      if (wasBlocked) maliciousBlocked++;
    } else {
      totalLegitimate++;
      if (wasAllowed) legitimateAllowed++;
    }

    results.push({
      packet,
      outcome,
      correct: (packet.isMalicious && wasBlocked) || (!packet.isMalicious && wasAllowed)
    });
  }

  const maliciousAccuracy = totalMalicious > 0 ? (maliciousBlocked / totalMalicious) : 1;
  const legitimateAccuracy = totalLegitimate > 0 ? (legitimateAllowed / totalLegitimate) : 1;
  const score = Math.round(((maliciousAccuracy * 0.6) + (legitimateAccuracy * 0.4)) * 100);
  const passed = score >= challenge.targetScore;

  return {
    score,
    passed,
    maliciousBlocked,
    totalMalicious,
    legitimateAllowed,
    totalLegitimate,
    xpAwarded: passed ? challenge.xpReward : Math.round(challenge.xpReward * (score / 100)),
    results
  };
}
