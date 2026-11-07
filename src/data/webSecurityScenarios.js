/**
 * Web Security & OWASP Defense Scenarios and Mission Data
 */

export const WEB_SECURITY_MISSIONS = [
  {
    id: "sqli-bypass",
    title: "SQL Injection: Authentication Bypass",
    category: "sqli",
    difficulty: "Medium",
    xpReward: 60,
    targetName: "Enterprise Employee Portal",
    targetEndpoint: "POST /api/auth/login",
    description:
      "An internal authentication endpoint interpolates raw username inputs directly into an SQL statement. Craft a tautology payload to authenticate without credentials, then apply Parameterized Prepared Statements to secure the login endpoint.",
    queryTemplate: "SELECT * FROM users WHERE username = '{INPUT}'",
    defaultPayload: "' OR '1'='1",
    presetPayloads: [
      { label: "Classic Tautology", payload: "' OR '1'='1" },
      { label: "Comment Truncation", payload: "admin' --" },
      { label: "UNION Select Extraction", payload: "' UNION SELECT username, password_hash FROM admin--" },
    ],
    vulnerableSnippet: `// Vulnerable Code (Raw String Interpolation)
app.post('/api/auth/login', async (req, res) => {
  const query = "SELECT * FROM users WHERE username = '" + req.body.username + "'";
  const user = await db.query(query); // ⚠️ SQL Injection Vulnerability!
  if (user) res.json({ token: generateToken(user) });
});`,
    secureSnippet: `// Secure Code (Parameterized Query)
app.post('/api/auth/login', async (req, res) => {
  const query = "SELECT * FROM users WHERE username = ?";
  const user = await db.query(query, [req.body.username]); // ✅ Input bound safely
  if (user) res.json({ token: generateToken(user) });
});`,
    defenseName: "Parameterized Prepared Statements",
    defenseExplanation:
      "Separates SQL command logic from untrusted user parameters. The database engine pre-compiles the query tree and interprets bound parameters purely as literal values.",
  },
  {
    id: "xss-stored",
    title: "Stored XSS: Session Hijacking Defense",
    category: "xss",
    difficulty: "Hard",
    xpReward: 60,
    targetName: "Customer Feedback Feed",
    targetEndpoint: "POST /api/feedback",
    description:
      "A customer feedback page renders user-submitted reviews directly into the DOM using innerHTML. Inject a JavaScript payload to demonstrate session token extraction, then apply Context-Aware HTML Entity Encoding to render markup harmlessly as plain text.",
    defaultPayload: "<script>alert(document.cookie)</script>",
    presetPayloads: [
      { label: "Script Tag Payload", payload: "<script>alert(document.cookie)</script>" },
      { label: "Image Event Handler", payload: '<img src="invalid" onerror="alert(document.cookie)" />' },
      { label: "SVG Load Vector", payload: '<svg onload="alert(\'XSS\')" />' },
    ],
    vulnerableSnippet: `// Vulnerable Code (Direct DOM Injection)
function displayComment(comment) {
  const container = document.getElementById('comments');
  container.innerHTML += '<div class="comment">' + comment.text + '</div>'; // ⚠️ XSS!
}`,
    secureSnippet: `// Secure Code (Context-Aware HTML Entity Encoding)
function displayComment(comment) {
  const container = document.getElementById('comments');
  const safeDiv = document.createElement('div');
  safeDiv.className = 'comment';
  safeDiv.textContent = comment.text; // ✅ textContent encodes HTML entities automatically
  container.appendChild(safeDiv);
}`,
    defenseName: "Context-Aware HTML Entity Encoding",
    defenseExplanation:
      "Translates special characters (<, >, &, \", ') into character reference entities (&lt;, &gt;, etc.) before output insertion, preventing the browser engine from parsing user strings as executable markup.",
  },
  {
    id: "idor-payroll",
    title: "IDOR: Horizontal Privilege Escalation",
    category: "idor",
    difficulty: "Medium",
    xpReward: 50,
    targetName: "Executive Payroll & Billing Portal",
    targetEndpoint: "GET /api/accounts/:id",
    description:
      "The billing API returns account records based on a client-supplied numeric ID parameter without verifying that the authenticated user owns the record. Access executive account #101 while logged in as standard user #102, then enforce Object-Level Authorization.",
    targetId: 101,
    currentSessionUser: { userId: 102, name: "Alex Rivera", role: "user" },
    presetPayloads: [
      { label: "Executive Account (Marcus Vance)", payload: "101" },
      { label: "My Account (Alex Rivera)", payload: "102" },
      { label: "Colleague Account (Sarah Chen)", payload: "103" },
    ],
    vulnerableSnippet: `// Vulnerable Code (Missing Authorization Check)
app.get('/api/accounts/:id', async (req, res) => {
  const account = await db.findAccountById(req.params.id); // ⚠️ No ownership validation!
  return res.json(account);
});`,
    secureSnippet: `// Secure Code (Enforce Object-Level Ownership)
app.get('/api/accounts/:id', async (req, res) => {
  const account = await db.findAccountById(req.params.id);
  // ✅ Verify current session owns target resource or is system administrator
  if (!account || (account.ownerId !== req.session.userId && req.session.role !== 'admin')) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return res.json(account);
});`,
    defenseName: "Object-Level Access Control",
    defenseExplanation:
      "Verifies on every request that the authenticated session user has ownership rights to the specific record before reading or modifying it.",
  },
  {
    id: "rce-diagnostic",
    title: "Command Injection: Remote Code Execution",
    category: "rce",
    difficulty: "Hard",
    xpReward: 60,
    targetName: "Network Diagnostic Tool",
    targetEndpoint: "POST /api/diagnostics/ping",
    description:
      "An admin web utility runs a shell ping subprocess with user input concatenated into the command line. Use command chaining delimiters (; or &&) to read system files (/etc/passwd), then implement Strict Hostname Whitelist Validation to block shell metacharacters.",
    defaultPayload: "127.0.0.1; whoami",
    presetPayloads: [
      { label: "Shell Separator + whoami", payload: "127.0.0.1; whoami" },
      { label: "Extract /etc/passwd", payload: "8.8.8.8 && cat /etc/passwd" },
      { label: "Directory Listing", payload: "1.1.1.1 | ls -la" },
    ],
    vulnerableSnippet: `// Vulnerable Code (Unsanitized Shell Subprocess)
app.post('/api/diagnostics/ping', (req, res) => {
  const cmd = "ping -c 2 " + req.body.host; // ⚠️ Shell Command Injection!
  exec(cmd, (err, stdout) => res.send(stdout));
});`,
    secureSnippet: `// Secure Code (Input Whitelist Validation & Parameter Separation)
app.post('/api/diagnostics/ping', (req, res) => {
  const host = req.body.host.trim();
  // ✅ Reject any input failing strict alphanumeric / IP format
  if (!/^[a-zA-Z0-9.-]+$/.test(host)) {
    return res.status(400).send("Invalid hostname");
  }
  execFile('ping', ['-c', '2', host], (err, stdout) => res.send(stdout));
});`,
    defenseName: "Strict Input Whitelisting & Parameter Separation",
    defenseExplanation:
      "Validates inputs against strict character whitelists and executes commands with parameterized arguments (execFile) rather than passing raw strings through a shell interpreter.",
  },
];
