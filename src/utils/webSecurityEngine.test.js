import test from 'node:test';
import assert from 'node:assert/strict';
import {
  encodeHtmlEntities,
  isValidHost,
  evaluateSqlQuery,
  evaluateXssPayload,
  evaluateIdorAccess,
  evaluateCommandInjection,
  evaluateChallengeMission,
} from './webSecurityEngine.js';
import { WEB_SECURITY_MISSIONS } from '../data/webSecurityScenarios.js';

test('encodeHtmlEntities safely escapes dangerous characters', () => {
  assert.equal(encodeHtmlEntities(''), '');
  assert.equal(encodeHtmlEntities(null), '');
  assert.equal(
    encodeHtmlEntities('<script>alert("XSS & test")</script>'),
    '&lt;script&gt;alert(&quot;XSS &amp; test&quot;)&lt;&#x2F;script&gt;'
  );
  assert.equal(encodeHtmlEntities("user' OR '1'='1"), 'user&#x27; OR &#x27;1&#x27;=&#x27;1');
});

test('isValidHost identifies valid and malicious host inputs', () => {
  assert.equal(isValidHost('8.8.8.8'), true);
  assert.equal(isValidHost('127.0.0.1'), true);
  assert.equal(isValidHost('api.example.internal'), true);
  assert.equal(isValidHost('google.com'), true);

  // Command injection separators should be rejected
  assert.equal(isValidHost('8.8.8.8; cat /etc/passwd'), false);
  assert.equal(isValidHost('127.0.0.1 && whoami'), false);
  assert.equal(isValidHost('`id`'), false);
  assert.equal(isValidHost('10.0.0.1 | ls'), false);
  assert.equal(isValidHost(''), false);
});

test('evaluateSqlQuery detects authentication bypass via tautology and UNION SELECT', () => {
  const template = "SELECT * FROM users WHERE username = '{INPUT}'";

  // Legitimate query
  const safeRun = evaluateSqlQuery({
    queryTemplate: template,
    input: 'alice',
    parameterized: false,
  });
  assert.equal(safeRun.bypassed, false);
  assert.equal(safeRun.vulnerable, true);

  // Tautology injection
  const tautologyRun = evaluateSqlQuery({
    queryTemplate: template,
    input: "' OR '1'='1",
    parameterized: false,
  });
  assert.equal(tautologyRun.bypassed, true);
  assert.equal(tautologyRun.mockRecords.length > 0, true);
  assert.match(tautologyRun.technique, /Tautology/i);

  // UNION SELECT injection
  const unionRun = evaluateSqlQuery({
    queryTemplate: template,
    input: "' UNION SELECT username, password_hash FROM admin--",
    parameterized: false,
  });
  assert.equal(unionRun.bypassed, true);
  assert.match(unionRun.technique, /UNION/i);
});

test('evaluateSqlQuery neutralizes injection when parameterized statements are enabled', () => {
  const template = "SELECT * FROM users WHERE username = '{INPUT}'";

  const defendedRun = evaluateSqlQuery({
    queryTemplate: template,
    input: "' OR '1'='1",
    parameterized: true,
  });

  assert.equal(defendedRun.bypassed, false);
  assert.equal(defendedRun.vulnerable, false);
  assert.equal(defendedRun.remediated, true);
  assert.deepEqual(defendedRun.boundParameters, ["' OR '1'='1"]);
  assert.match(defendedRun.executedQuery, /\?/);
});

test('evaluateXssPayload flags inline script and event handler vectors', () => {
  // Script tag
  const scriptRun = evaluateXssPayload({
    input: '<script>alert(document.cookie)</script>',
  });
  assert.equal(scriptRun.executed, true);
  assert.equal(scriptRun.vulnerable, true);
  assert.ok(scriptRun.capturedCookie);

  // Event handler
  const eventRun = evaluateXssPayload({
    input: '<img src=x onerror=alert(1)>',
  });
  assert.equal(eventRun.executed, true);

  // Pseudoprotocol
  const jsRun = evaluateXssPayload({
    input: 'javascript:alert(1)',
  });
  assert.equal(jsRun.executed, true);
});

test('evaluateXssPayload remediates injection via HTML entity encoding or DOM sanitization', () => {
  const payload = '<script>alert(1)</script>';

  // HTML entity encoding
  const encodedRun = evaluateXssPayload({
    input: payload,
    htmlEncoding: true,
  });
  assert.equal(encodedRun.executed, false);
  assert.equal(encodedRun.remediated, true);
  assert.match(encodedRun.renderedHtml, /&lt;script&gt;/);

  // DOM sanitization
  const sanitizedRun = evaluateXssPayload({
    input: '<img src="x" onerror="steal()" /><p>Safe text</p>',
    domSanitize: true,
  });
  assert.equal(sanitizedRun.executed, false);
  assert.equal(sanitizedRun.remediated, true);
  assert.doesNotMatch(sanitizedRun.renderedHtml, /onerror/i);
});

test('evaluateIdorAccess detects horizontal privilege escalation and enforces ownership', () => {
  // Session belongs to Alex Rivera (ID 102)
  const session = { userId: 102, role: 'user' };

  // Own record access
  const ownAccess = evaluateIdorAccess({
    requestedId: 102,
    currentSession: session,
    enforceOwnership: false,
  });
  assert.equal(ownAccess.status, 200);
  assert.equal(ownAccess.breached, false);

  // IDOR cross-account access (vulnerable)
  const idorBreach = evaluateIdorAccess({
    requestedId: 101, // Marcus Vance (Executive)
    currentSession: session,
    enforceOwnership: false,
  });
  assert.equal(idorBreach.status, 200);
  assert.equal(idorBreach.breached, true);
  assert.equal(idorBreach.record.name, 'Marcus Vance');

  // Remediated IDOR with ownership enforcement
  const blockedAccess = evaluateIdorAccess({
    requestedId: 101,
    currentSession: session,
    enforceOwnership: true,
  });
  assert.equal(blockedAccess.status, 403);
  assert.equal(blockedAccess.breached, false);
  assert.equal(blockedAccess.record, null);
});

test('evaluateCommandInjection identifies chained shell commands and validates whitelists', () => {
  // Semicolon separator
  const rce1 = evaluateCommandInjection({
    input: '127.0.0.1; whoami',
    whitelistValidation: false,
  });
  assert.equal(rce1.executed, true);
  assert.equal(rce1.vulnerable, true);
  assert.match(rce1.output, /www-data/);

  // /etc/passwd extraction
  const rce2 = evaluateCommandInjection({
    input: '8.8.8.8 && cat /etc/passwd',
    whitelistValidation: false,
  });
  assert.equal(rce2.executed, true);
  assert.match(rce2.output, /root:x:0:0/);

  // Remediated whitelist validation
  const blockedRce = evaluateCommandInjection({
    input: '8.8.8.8; cat /etc/passwd',
    whitelistValidation: true,
  });
  assert.equal(blockedRce.vulnerable, false);
  assert.equal(blockedRce.remediated, true);
  assert.match(blockedRce.output, /Validation Error/);
});

test('evaluateChallengeMission awards XP and evaluates pass/fail status', () => {
  // SQLi mission
  const sqliMission = {
    id: 'sqli-1',
    category: 'sqli',
    template: "SELECT * FROM users WHERE username = '{INPUT}'",
    xpReward: 60,
  };

  // Winning solution: triggered exploit and enabled defense
  const passSolution = {
    payload: "' OR '1'='1",
    defenseActive: true,
  };
  const passResult = evaluateChallengeMission(sqliMission, passSolution);
  assert.equal(passResult.passed, true);
  assert.equal(passResult.score, 100);
  assert.equal(passResult.xpEarned, 60);
  assert.ok(passResult.executionResult);
  assert.equal(passResult.executionResult.remediated, true);

  // Incomplete solution: exploit triggered but defense disabled
  const failSolution = {
    payload: "' OR '1'='1",
    defenseActive: false,
  };
  const failResult = evaluateChallengeMission(sqliMission, failSolution);
  assert.equal(failResult.passed, false);
  assert.equal(failResult.xpEarned, 0);
  assert.ok(failResult.executionResult);
  assert.equal(failResult.executionResult.bypassed, true);
});

test('evaluateSqlQuery handles SQL comments, stacked queries, and undefined template safely', () => {
  const commentRun = evaluateSqlQuery({
    input: "admin' --",
    parameterized: false,
  });
  assert.equal(commentRun.bypassed, true);
  assert.match(commentRun.executedQuery, /SELECT \* FROM users/);

  const stackedRun = evaluateSqlQuery({
    queryTemplate: "SELECT * FROM users WHERE username = '{INPUT}'",
    input: "alice'; DROP TABLE users;--",
    parameterized: false,
  });
  assert.equal(stackedRun.bypassed, true);
});

test('evaluateXssPayload detects svg onload vector and preserves safe text under htmlEncoding', () => {
  const svgRun = evaluateXssPayload({
    input: '<svg onload="alert(1)" />',
  });
  assert.equal(svgRun.executed, true);
  assert.equal(svgRun.vulnerable, true);

  const safeTextRun = evaluateXssPayload({
    input: 'Great dashboard experience!',
    htmlEncoding: true,
  });
  assert.equal(safeTextRun.executed, false);
  assert.equal(safeTextRun.remediated, true);
  assert.equal(safeTextRun.renderedHtml, 'Great dashboard experience!');
});

test('evaluateIdorAccess handles admin privileges and missing object IDs', () => {
  const adminResult = evaluateIdorAccess({
    requestedId: 101,
    currentSession: { userId: 999, role: 'admin' },
    enforceOwnership: true,
  });
  assert.equal(adminResult.status, 200);
  assert.equal(adminResult.authorized, true);
  assert.equal(adminResult.breached, false);

  const missingResult = evaluateIdorAccess({
    requestedId: 9999,
    currentSession: { userId: 102, role: 'user' },
    enforceOwnership: true,
  });
  assert.equal(missingResult.status, 404);
  assert.equal(missingResult.record, null);
});

test('evaluateCommandInjection executes safe host pings when whitelisting is enabled', () => {
  const validPing = evaluateCommandInjection({
    input: '8.8.8.8',
    whitelistValidation: true,
  });
  assert.equal(validPing.vulnerable, false);
  assert.equal(validPing.executed, true);
  assert.equal(validPing.remediated, true);
  assert.match(validPing.commandRun, /^ping -c 2 8\.8\.8\.8$/);
});

test('evaluateChallengeMission validates all 4 WEB_SECURITY_MISSIONS end-to-end', () => {
  const [sqliMission, xssMission, idorMission, rceMission] = WEB_SECURITY_MISSIONS;

  // 1. SQLi mission with queryTemplate property from scenario config
  const sqliPass = evaluateChallengeMission(sqliMission, {
    payload: sqliMission.defaultPayload,
    defenseActive: true,
  });
  assert.equal(sqliPass.passed, true);
  assert.equal(sqliPass.xpEarned, sqliMission.xpReward);
  assert.ok(sqliPass.executionResult.executedQuery);

  // 2. XSS mission
  const xssPass = evaluateChallengeMission(xssMission, {
    payload: xssMission.defaultPayload,
    defenseActive: true,
  });
  assert.equal(xssPass.passed, true);
  assert.equal(xssPass.xpEarned, xssMission.xpReward);
  assert.ok(xssPass.executionResult.renderedHtml !== undefined);

  const xssFail = evaluateChallengeMission(xssMission, {
    payload: 'benign review',
    defenseActive: true,
  });
  assert.equal(xssFail.passed, false);

  // 3. IDOR mission
  const idorPass = evaluateChallengeMission(idorMission, {
    targetId: '101',
    defenseActive: true,
  });
  assert.equal(idorPass.passed, true);
  assert.equal(idorPass.xpEarned, idorMission.xpReward);
  assert.equal(idorPass.executionResult.status, 403);

  const idorFailOwn = evaluateChallengeMission(idorMission, {
    targetId: '102',
    defenseActive: true,
  });
  assert.equal(idorFailOwn.passed, false);

  // 4. RCE mission
  const rcePass = evaluateChallengeMission(rceMission, {
    payload: rceMission.defaultPayload,
    defenseActive: true,
  });
  assert.equal(rcePass.passed, true);
  assert.equal(rcePass.xpEarned, rceMission.xpReward);
  assert.ok(rcePass.executionResult.output);

  const rceFailSafeHost = evaluateChallengeMission(rceMission, {
    payload: '8.8.8.8',
    defenseActive: true,
  });
  assert.equal(rceFailSafeHost.passed, false);
});
