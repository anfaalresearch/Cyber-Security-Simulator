/**
 * Web Security & OWASP Defense Engine
 *
 * Deterministic engine for evaluating web application vulnerabilities
 * and testing real-world secure coding remediations.
 */

/**
 * Encodes special characters to prevent HTML context injection (XSS defense).
 * @param {string} str
 * @returns {string}
 */
export const encodeHtmlEntities = (str) => {
  if (typeof str !== "string") return "";
  return str.replace(/[&<>"'/]/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#x27;";
      case "/":
        return "&#x2F;";
      default:
        return char;
    }
  });
};

/**
 * Validates whether an IP address or hostname is strictly alphanumeric/safe.
 * @param {string} host
 * @returns {boolean}
 */
export const isValidHost = (host) => {
  if (typeof host !== "string") return false;
  const trimmed = host.trim();
  // Valid IPv4 format: 4 octets 0-255
  const ipv4Regex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  // Valid hostname / domain format
  const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return ipv4Regex.test(trimmed) || hostnameRegex.test(trimmed);
};

/**
 * Evaluates an SQL query against input, detecting SQLi patterns or verifying Prepared Statement defenses.
 *
 * @param {Object} options
 * @param {string} options.queryTemplate - e.g. "SELECT * FROM users WHERE username = '{INPUT}'"
 * @param {string} options.input - Learner's input payload
 * @param {boolean} [options.parameterized=false] - Whether parameterized prepared statement defense is active
 * @returns {Object} evaluation outcome
 */
export const evaluateSqlQuery = ({ queryTemplate, input, parameterized = false }) => {
  const safeTemplate =
    typeof queryTemplate === "string" && queryTemplate.length > 0
      ? queryTemplate
      : "SELECT * FROM users WHERE username = '{INPUT}'";
  const rawInput = typeof input === "string" ? input : "";

  // Common SQL injection vectors
  const tautologyRegex = /('\s*(or|\|\|)\s*('?[0-9a-zA-Z]+'?\s*=\s*'?[0-9a-zA-Z]+'?|true|1\s*=\s*1))/i;
  const unionRegex = /(\bunion\s+(all\s+)?select\b)/i;
  const commentRegex = /(--|#|\/\*)/;
  const stackedQueryRegex = /(;\s*(drop|delete|insert|update|alter)\b)/i;

  const isTautology = tautologyRegex.test(rawInput);
  const isUnion = unionRegex.test(rawInput);
  const isCommented = commentRegex.test(rawInput);
  const isStacked = stackedQueryRegex.test(rawInput);

  const hasSqliPattern = isTautology || isUnion || isCommented || isStacked;

  if (parameterized) {
    // Parameterized defense: input is passed as a bound parameter ($1 or ?)
    const safeCompiledQuery = safeTemplate
      .replace("'{INPUT}'", "?")
      .replace("{INPUT}", "?");

    return {
      vulnerable: false,
      bypassed: false,
      executedQuery: safeCompiledQuery,
      boundParameters: [rawInput],
      remediated: true,
      technique: hasSqliPattern ? "Neutralized by Prepared Statement" : "Standard Safe Execution",
      explanation:
        "Prepared statements treat user input strictly as a parameter value, completely preventing string interpolation from altering the SQL command syntax.",
      mockRecords: hasSqliPattern
        ? []
        : [
            {
              id: 104,
              username: rawInput || "guest",
              role: "user",
            },
          ],
    };
  }

  // Vulnerable interpolation
  const interpolatedQuery = safeTemplate.replace("{INPUT}", rawInput);

  if (hasSqliPattern) {
    let technique = "SQL Injection Detected";
    let mockRecords = [];

    if (isTautology) {
      technique = "Authentication Bypass via Tautology (' OR 1=1)";
      mockRecords = [
        { id: 1, username: "admin", role: "administrator", email: "admin@enterprise.internal" },
        { id: 2, username: "ciso_david", role: "security_lead", email: "david@enterprise.internal" },
      ];
    } else if (isUnion) {
      technique = "Data Extraction via UNION SELECT";
      mockRecords = [
        { id: 1, username: "admin", password_hash: "$2b$12$e8x...[EXTRACTED_HASH]" },
        { id: 2, username: "finance_lead", password_hash: "$2b$12$v9y...[EXTRACTED_HASH]" },
      ];
    } else {
      technique = "Query Truncation via SQL Comment Injection";
      mockRecords = [{ id: 1, username: "admin", role: "administrator" }];
    }

    return {
      vulnerable: true,
      bypassed: true,
      executedQuery: interpolatedQuery,
      boundParameters: null,
      remediated: false,
      technique,
      explanation:
        "Unsanitized user input escaped the string literal boundary and altered the query AST logic, executing unauthorized SQL commands.",
      mockRecords,
    };
  }

  return {
    vulnerable: true,
    bypassed: false,
    executedQuery: interpolatedQuery,
    boundParameters: null,
    remediated: false,
    technique: "Standard Query (No exploit triggered)",
    explanation: "User input was interpolated directly, but the provided input did not trigger a syntax escape.",
    mockRecords: [{ id: 101, username: rawInput || "testuser", role: "user" }],
  };
};

/**
 * Evaluates an XSS payload in simulated browser context.
 *
 * @param {Object} options
 * @param {string} options.input - Learner's input payload
 * @param {boolean} [options.htmlEncoding=false] - Whether HTML entity encoding remediation is applied
 * @param {boolean} [options.domSanitize=false] - Whether DOMPurify sanitization is applied
 * @returns {Object} evaluation outcome
 */
export const evaluateXssPayload = ({ input, htmlEncoding = false, domSanitize = false }) => {
  const rawInput = typeof input === "string" ? input : "";

  const scriptTagRegex = /<\s*script[^>]*>.*?<\s*\/\s*script\s*>/is;
  const eventHandlerRegex = /\b(on\w+)\s*=\s*["']?[^"'>]+["']?/i;
  const javascriptUriRegex = /javascript\s*:\s*[^\s"']+/i;
  const imgErrorRegex = /<\s*img\b[^>]*\bonerror\s*=[^>]*>/i;
  const svgOnloadRegex = /<\s*svg\b[^>]*\bonload\s*=[^>]*>/i;

  const isScriptTag = scriptTagRegex.test(rawInput);
  const isEventHandler = eventHandlerRegex.test(rawInput);
  const isJavascriptUri = javascriptUriRegex.test(rawInput);
  const isImgPayload = imgErrorRegex.test(rawInput);
  const isSvgPayload = svgOnloadRegex.test(rawInput);

  const hasXss = isScriptTag || isEventHandler || isJavascriptUri || isImgPayload || isSvgPayload;

  if (htmlEncoding) {
    const encoded = encodeHtmlEntities(rawInput);
    return {
      vulnerable: false,
      executed: false,
      renderedHtml: encoded,
      remediated: true,
      technique: "Neutralized via Context-Aware HTML Entity Encoding",
      explanation:
        "Special characters (<, >, &, \", ') were encoded into HTML entities, instructing the browser DOM engine to parse the input strictly as text rather than executable script markup.",
      capturedCookie: null,
    };
  }

  if (domSanitize) {
    // Strip malicious tags and event handlers
    const sanitized = rawInput
      .replace(/<\s*script\b[^>]*>.*?<\s*\/\s*script\s*>/gi, "")
      .replace(/\bon\w+\s*=\s*(['"]).*?\1/gi, "")
      .replace(/\bon\w+\s*=\s*[^>\s]+/gi, "")
      .replace(/javascript:[^"'\s]+/gi, "");

    return {
      vulnerable: false,
      executed: false,
      renderedHtml: sanitized,
      remediated: true,
      technique: "Sanitized via DOM Sanitization Policy",
      explanation: "Active script tags and event handlers were stripped from the markup tree.",
      capturedCookie: null,
    };
  }

  // Vulnerable rendering
  if (hasXss) {
    let vector = "Cross-Site Scripting (XSS)";
    if (isScriptTag) vector = "Inline <script> Tag Execution";
    else if (isImgPayload || isEventHandler) vector = "Inline Event Handler Execution (e.g. onerror)";
    else if (isJavascriptUri) vector = "Pseudoprotocol (javascript:) Execution";

    return {
      vulnerable: true,
      executed: true,
      renderedHtml: rawInput,
      remediated: false,
      technique: vector,
      explanation:
        "Unfiltered input was inserted into the DOM. The browser parsed and executed arbitrary JavaScript in the victim's session context.",
      capturedCookie: "session_token=eyJhGciOiJIUzI1NiIsInR5cCI...; secure=false",
    };
  }

  return {
    vulnerable: true,
    executed: false,
    renderedHtml: rawInput,
    remediated: false,
    technique: "Benign Text",
    explanation: "The input was inserted into the DOM without sanitization, but no executable script vector was detected.",
    capturedCookie: null,
  };
};

/**
 * Evaluates an IDOR (Insecure Direct Object Reference) request.
 *
 * @param {Object} options
 * @param {string|number} options.requestedId - The target object ID requested in URL/Body
 * @param {Object} options.currentSession - Authenticated user context
 * @param {number} options.currentSession.userId - ID of logged in user
 * @param {string} options.currentSession.role - Role of logged in user ("user" | "admin")
 * @param {boolean} [options.enforceOwnership=false] - Whether server-side authorization check is active
 * @returns {Object} evaluation outcome
 */
export const evaluateIdorAccess = ({
  requestedId,
  currentSession,
  enforceOwnership = false,
}) => {
  const reqId = parseInt(requestedId, 10);
  const sessionUserId = currentSession?.userId ?? 102;
  const sessionRole = currentSession?.role ?? "user";

  const recordsDatabase = {
    101: {
      ownerId: 101,
      name: "Marcus Vance",
      accountNumber: "ACC-9941-882",
      balance: "$124,500.00",
      tier: "Executive Platinum",
      notes: "Internal executive payroll account. Confidential.",
    },
    102: {
      ownerId: 102,
      name: "Alex Rivera",
      accountNumber: "ACC-1024-551",
      balance: "$2,450.00",
      tier: "Standard Checking",
      notes: "Active personal account.",
    },
    103: {
      ownerId: 103,
      name: "Sarah Chen",
      accountNumber: "ACC-3312-901",
      balance: "$8,920.00",
      tier: "Standard Checking",
      notes: "Savings auto-deposit enabled.",
    },
  };

  const targetRecord = recordsDatabase[reqId];

  if (!targetRecord) {
    return {
      status: 404,
      authorized: false,
      breached: false,
      record: null,
      technique: "Record Not Found",
      explanation: `No record found matching identifier ID ${requestedId}.`,
    };
  }

  const isOwner = targetRecord.ownerId === sessionUserId;
  const isAdmin = sessionRole === "admin";

  if (enforceOwnership) {
    if (isOwner || isAdmin) {
      return {
        status: 200,
        authorized: true,
        breached: false,
        record: targetRecord,
        technique: "Authorized Access Enforced",
        explanation:
          "Server verified that the authenticated session ownership matches the requested object ID before serving the record.",
      };
    }
    return {
      status: 403,
      authorized: false,
      breached: false,
      record: null,
      technique: "Access Denied via Object-Level Authorization (403 Forbidden)",
      explanation:
        "Authorization defense successfully blocked horizontal privilege escalation: session user is not permitted to access record owned by ID " +
        targetRecord.ownerId +
        ".",
    };
  }

  // Vulnerable IDOR state: serves any record requested
  if (!isOwner && !isAdmin) {
    return {
      status: 200,
      authorized: false,
      breached: true,
      record: targetRecord,
      technique: "IDOR: Horizontal Privilege Escalation",
      explanation:
        "The application relied on client-supplied ID without verifying that the authenticated session had ownership permissions for record ID " +
        reqId +
        ".",
    };
  }

  return {
    status: 200,
    authorized: true,
    breached: false,
    record: targetRecord,
    technique: "Legitimate Owner Access",
    explanation: "User requested their own record.",
  };
};

/**
 * Evaluates OS Command Injection input.
 *
 * @param {Object} options
 * @param {string} options.input - User input parameter (e.g. host to ping)
 * @param {boolean} [options.whitelistValidation=false] - Whether strict whitelist validation is enforced
 * @returns {Object} evaluation outcome
 */
export const evaluateCommandInjection = ({ input, whitelistValidation = false }) => {
  const rawInput = typeof input === "string" ? input : "";

  const separatorRegex = /([;&|`]|&&|\|\||\$\(.*?\))/;
  const dangerousCommands = /(cat\s+\/etc\/passwd|whoami|id|ls|uname\s+-a|rm\s+-rf|nc\s+-e)/i;

  const hasSeparator = separatorRegex.test(rawInput);
  const matchesCommand = dangerousCommands.test(rawInput);

  if (whitelistValidation) {
    const isSafe = isValidHost(rawInput);
    if (!isSafe) {
      return {
        vulnerable: false,
        executed: false,
        commandRun: null,
        output: "Validation Error: Hostname or IP contains illegal characters.",
        remediated: true,
        technique: "Blocked by Input Whitelist Validation",
        explanation:
          "Strict whitelist regex validation rejected input containing shell control characters or command separators before invoking the operating system subprocess.",
      };
    }

    return {
      vulnerable: false,
      executed: true,
      commandRun: `ping -c 2 ${rawInput.trim()}`,
      output: `PING ${rawInput.trim()} (32 bytes of data)\n32 bytes from ${rawInput.trim()}: icmp_seq=1 time=12.4 ms\n32 bytes from ${rawInput.trim()}: icmp_seq=2 time=11.8 ms\n--- 2 packets transmitted, 2 received, 0% packet loss ---`,
      remediated: true,
      technique: "Safe Whitelisted Execution",
      explanation: "Input validated safely against host format constraints.",
    };
  }

  // Vulnerable execution
  if (hasSeparator || matchesCommand) {
    let simulatedOutput = "";
    if (/cat\s+\/etc\/passwd/i.test(rawInput)) {
      simulatedOutput =
        "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nadmin:x:1000:1000:Admin:/home/admin:/bin/bash";
    } else if (/whoami/i.test(rawInput)) {
      simulatedOutput = "www-data (uid=33, gid=33)";
    } else if (/id/i.test(rawInput)) {
      simulatedOutput = "uid=33(www-data) gid=33(www-data) groups=33(www-data)";
    } else {
      simulatedOutput =
        "bin  boot  dev  etc  home  lib  opt  root  sys  tmp  usr  var";
    }

    return {
      vulnerable: true,
      executed: true,
      commandRun: `ping -c 2 ${rawInput}`,
      output: simulatedOutput,
      remediated: false,
      technique: "OS Command Injection (Remote Code Execution)",
      explanation:
        "Shell control characters (; or &&) separated the command and allowed execution of arbitrary operating system commands with server privileges.",
    };
  }

  return {
    vulnerable: true,
    executed: true,
    commandRun: `ping -c 2 ${rawInput}`,
    output: `PING ${rawInput} (32 bytes of data)\n32 bytes from ${rawInput}: icmp_seq=1 time=14.1 ms\n--- 1 packets transmitted, 1 received, 0% packet loss ---`,
    remediated: false,
    technique: "Vulnerable Subprocess Execution (No separator used)",
    explanation: "Command executed via shell without syntax separation.",
  };
};

/**
 * Evaluates an interactive defense challenge mission.
 *
 * @param {Object} mission - Mission definition object
 * @param {Object} solution - Learner solution state
 * @returns {Object} score, pass/fail status, and explanation
 */
export const evaluateChallengeMission = (mission, solution) => {
  if (!mission || !solution) {
    return { passed: false, score: 0, feedback: "Invalid mission configuration." };
  }

  switch (mission.category) {
    case "sqli": {
      const sqlTemplate = mission.queryTemplate || mission.template;
      const exploitResult = evaluateSqlQuery({
        queryTemplate: sqlTemplate,
        input: solution.payload,
        parameterized: false,
      });

      const defenseResult = evaluateSqlQuery({
        queryTemplate: sqlTemplate,
        input: solution.payload,
        parameterized: solution.defenseActive,
      });

      const activeResult = solution.defenseActive ? defenseResult : exploitResult;

      // A pass requires that the exploit succeeded without defense, AND was neutralized with defense active
      const exploitSucceeded = exploitResult.bypassed;
      const defenseNeutralized = !defenseResult.bypassed && solution.defenseActive;

      if (exploitSucceeded && defenseNeutralized) {
        return {
          passed: true,
          score: 100,
          xpEarned: mission.xpReward || 60,
          feedback:
            "Outstanding work! You demonstrated authentication bypass via SQL injection and successfully neutralized the threat by applying Parameterized Prepared Statements.",
          executionResult: activeResult,
        };
      }

      if (!exploitSucceeded) {
        return {
          passed: false,
          score: 30,
          xpEarned: 0,
          feedback: "The submitted payload did not successfully trigger an SQL injection bypass. Try a tautology vector (e.g. ' OR 1=1 --).",
          executionResult: activeResult,
        };
      }

      return {
        passed: false,
        score: 50,
        xpEarned: 0,
        feedback: "Exploit succeeded, but the defense was not properly enabled to remediate the vulnerability.",
        executionResult: activeResult,
      };
    }

    case "xss": {
      const exploitResult = evaluateXssPayload({
        input: solution.payload,
        htmlEncoding: false,
      });

      const defenseResult = evaluateXssPayload({
        input: solution.payload,
        htmlEncoding: solution.defenseActive,
      });

      const activeResult = solution.defenseActive ? defenseResult : exploitResult;

      const exploitSucceeded = exploitResult.executed;
      const defenseNeutralized = !defenseResult.executed && solution.defenseActive;

      if (exploitSucceeded && defenseNeutralized) {
        return {
          passed: true,
          score: 100,
          xpEarned: mission.xpReward || 60,
          feedback:
            "Great job! You executed a Cross-Site Scripting payload and secured the application using Context-Aware HTML Entity Encoding.",
          executionResult: activeResult,
        };
      }

      return {
        passed: false,
        score: exploitSucceeded ? 50 : 25,
        xpEarned: 0,
        feedback: exploitSucceeded
          ? "Payload executed in the browser, but contextual encoding remediation was not enabled."
          : "Payload did not trigger script execution. Try an inline tag or event handler vector.",
        executionResult: activeResult,
      };
    }

    case "idor": {
      const exploitResult = evaluateIdorAccess({
        requestedId: solution.targetId,
        currentSession: { userId: 102, role: "user" },
        enforceOwnership: false,
      });

      const defenseResult = evaluateIdorAccess({
        requestedId: solution.targetId,
        currentSession: { userId: 102, role: "user" },
        enforceOwnership: solution.defenseActive,
      });

      const activeResult = solution.defenseActive ? defenseResult : exploitResult;

      const exploitSucceeded = exploitResult.breached;
      const defenseNeutralized = defenseResult.status === 403 && solution.defenseActive;

      if (exploitSucceeded && defenseNeutralized) {
        return {
          passed: true,
          score: 100,
          xpEarned: mission.xpReward || 50,
          feedback:
            "Excellent! You identified unauthorized object access via IDOR and enforced server-side ownership checks to block horizontal escalation.",
          executionResult: activeResult,
        };
      }

      return {
        passed: false,
        score: exploitSucceeded ? 50 : 25,
        xpEarned: 0,
        feedback: exploitSucceeded
          ? "Unauthorized record was accessed, but object ownership enforcement was not toggled."
          : "Target record does not trigger a cross-account breach.",
        executionResult: activeResult,
      };
    }

    case "rce": {
      const exploitResult = evaluateCommandInjection({
        input: solution.payload,
        whitelistValidation: false,
      });

      const defenseResult = evaluateCommandInjection({
        input: solution.payload,
        whitelistValidation: solution.defenseActive,
      });

      const activeResult = solution.defenseActive ? defenseResult : exploitResult;

      const exploitSucceeded =
        exploitResult.vulnerable &&
        exploitResult.executed &&
        exploitResult.technique.includes("Command Injection");
      const defenseNeutralized = !defenseResult.vulnerable && solution.defenseActive;

      if (exploitSucceeded && defenseNeutralized) {
        return {
          passed: true,
          score: 100,
          xpEarned: mission.xpReward || 60,
          feedback:
            "Superb! You demonstrated command separator injection and enforced strict input whitelist validation to protect the host operating system.",
          executionResult: activeResult,
        };
      }

      return {
        passed: false,
        score: exploitSucceeded ? 50 : 25,
        xpEarned: 0,
        feedback: exploitSucceeded
          ? "Command injection succeeded, but whitelist validation was not enabled to block it."
          : "Input did not execute a chained shell command.",
        executionResult: activeResult,
      };
    }

    default:
      return { passed: false, score: 0, feedback: "Unknown challenge category." };
  }
};
