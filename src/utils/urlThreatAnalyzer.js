import { parse } from "tldts";

const BRAND_NAMES = [
  "paypal", "amazon", "google", "microsoft", "apple",
  "netflix", "facebook", "instagram", "github", "linkedin",
  "outlook", "dropbox", "adobe", "chase", "wellsfargo",
];

const SUSPICIOUS_TLDS = new Set([
  "click", "country", "gq", "loan", "men", "mom", "party",
  "support", "top", "work", "zip",
]);



const HOMOGLYPH_REPLACEMENTS = {
  "0": "o",
  "1": "l",
  "3": "e",
  "5": "s",
  "7": "t",
  "8": "b",
};

const normalizeLookalikes = (value) =>
  value
    .toLowerCase()
    .replace(/[013578]/g, (character) => HOMOGLYPH_REPLACEMENTS[character]);

const isIpAddress = (hostname) => {
  const unwrapped = hostname.replace(/^\[|\]$/g, "");
  const ipv4 =
    /^(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
  return ipv4.test(unwrapped) || unwrapped.includes(":");
};

const getRegistrableDomain = (hostname) => {
  const result = parse(hostname);

  return result.domain || hostname.toLowerCase();
};

const getRiskLevel = (score) => {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "moderate";
  return "low";
};

const extractHostnameFromInput = (input) => {
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(input)
    ? input
    : `https://${input}`;
  return new URL(candidate);
};

/**
 * Analyze a URL using deterministic, explainable heuristics.
 * This is an educational signal, not a malware verdict or reputation lookup.
 */
export const analyzeUrl = (input) => {
  const original = typeof input === "string" ? input.trim() : "";

  if (!original || /[\u0000-\u001f\u007f]/.test(original)) {
    return {
      input: original,
      isValid: false,
      error: "Enter a URL without control characters.",
      score: 0,
      riskLevel: "unknown",
      findings: [],
    };
  }

  let parsed;
  try {
    parsed = extractHostnameFromInput(original);
  } catch {
    return {
      input: original,
      isValid: false,
      error: "This URL could not be parsed. Check the address and try again.",
      score: 0,
      riskLevel: "unknown",
      findings: [],
    };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return {
      input: original,
      isValid: false,
      error: "Only HTTP and HTTPS web addresses can be analyzed.",
      score: 0,
      riskLevel: "unknown",
      findings: [],
    };
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^\.$/, "");
  if (!hostname || !hostname.includes(".") && !isIpAddress(hostname)) {
    return {
      input: original,
      isValid: false,
      error: "Enter a fully qualified website domain.",
      score: 0,
      riskLevel: "unknown",
      findings: [],
    };
  }

  const findings = [];
  const addFinding = (code, title, detail, points) => {
    if (!findings.some((finding) => finding.code === code)) {
      findings.push({ code, title, detail, points });
    }
  };

  const domainInfo = parse(hostname);

  const registrableDomain = domainInfo.domain || hostname;
  const registrableLabel = registrableDomain
  .split(".")[0] || "";

  const subdomain = domainInfo.subdomain || "";
  const normalizedLabel = normalizeLookalikes(registrableLabel);
  const topLevelDomain = hostname.split(".").at(-1) || "";

  if (parsed.protocol === "http:") {
    addFinding(
      "insecure-http",
      "Unencrypted HTTP connection",
      "HTTP does not encrypt traffic in transit. Never enter passwords or payment details on an HTTP page.",
      15
    );
  }

  if (isIpAddress(hostname)) {
    addFinding(
      "ip-host",
      "IP address used as the host",
      "A raw IP address hides the recognizable website domain and is uncommon for public sign-in pages.",
      25
    );
  }

  if (hostname.split(".").some((label) => label.startsWith("xn--"))) {
    addFinding(
      "punycode",
      "Punycode / internationalized hostname",
      "The hostname contains an encoded internationalized label. Check for lookalike characters before trusting it.",
      25
    );
  }

  if (parsed.username || parsed.password) {
    addFinding(
      "userinfo",
      "Credentials embedded in URL",
      "The URL contains user-information syntax, which can make the actual destination difficult to notice.",
      25
    );
  }

  if (parsed.port && !["80", "443"].includes(parsed.port)) {
    addFinding(
      "unusual-port",
      "Non-standard port",
      `The address uses port ${parsed.port} instead of the usual HTTP/HTTPS ports.`,
      15
    );
  }

  if (SUSPICIOUS_TLDS.has(topLevelDomain)) {
    addFinding(
      "suspicious-tld",
      "TLD often seen in suspicious links",
      `The .${topLevelDomain} suffix deserves extra scrutiny. A TLD alone does not prove a site is malicious.`,
      10
    );
  }

  const impersonatedBrand = BRAND_NAMES.find((brand) => {
    const appearsInDomain = normalizedLabel.includes(brand);
    const isExactBrandDomain = normalizedLabel === brand;
    return appearsInDomain && !isExactBrandDomain;
  });

  if (impersonatedBrand) {
    addFinding(
      "brand-lookalike",
      "Possible brand lookalike domain",
      `The registered domain resembles “${impersonatedBrand}” but is not the exact brand domain. Verify the spelling and official address.`,
      30
    );
  } else {
    const subdomainBrand = BRAND_NAMES.find((brand) =>
      subdomain.split(".").some((label) => normalizeLookalikes(label).includes(brand))
    );
    if (subdomainBrand) {
      addFinding(
        "brand-in-subdomain",
        "Brand name appears only in a subdomain",
        `“${subdomainBrand}” appears before the registered domain, not as the registered website domain.`,
        30
      );
    }
  }

  const encodedParts = original.match(/%[\da-f]{2}/gi) || [];
  const encodedDelimiters = /%(?:2f|5c|40|3a|2e|25|00)/i.test(original);
  if (encodedDelimiters || encodedParts.length >= 5) {
    addFinding(
      "encoded-structure",
      "Potentially obfuscated URL encoding",
      "The URL encodes structural characters or contains many encoded bytes. Decode and inspect it before opening.",
      20
    );
  }

  if (parsed.pathname.includes("\\") || /\.{2,}/.test(parsed.pathname)) {
    addFinding(
      "misleading-path",
      "Unusual path structure",
      "The path contains backslashes or repeated dots that may make the destination harder to read.",
      10
    );
  }

  const score = Math.min(
    100,
    findings.reduce((total, finding) => total + finding.points, 0)
  );

  return {
    input: original,
    normalizedUrl: parsed.href,
    isValid: true,
    hostname,
    registrableDomain,
    score,
    riskLevel: getRiskLevel(score),
    findings,
  };
};

export const extractUrls = (text) => {
  if (typeof text !== "string" || !text) return [];
  const matches = text.match(/https?:\/\/[^\s<>"']+/gi) || [];
  return [...new Set(matches.map((value) => value.replace(/[),.;!?]+$/, "")))];
};
