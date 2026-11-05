import test from "node:test";
import assert from "node:assert/strict";
import { analyzeUrl, extractUrls } from "./urlThreatAnalyzer.js";

test("recognizes a normal HTTPS website as low risk", () => {
  const result = analyzeUrl("https://accounts.google.com/signin");
  assert.equal(result.isValid, true);
  assert.equal(result.riskLevel, "low");
  assert.equal(result.findings.length, 0);
});

test("flags a brand lookalike domain", () => {
  const result = analyzeUrl("http://paypa1-secure-login.com/signin");
  assert.ok(result.findings.some((finding) => finding.code === "brand-lookalike"));
  assert.ok(result.score >= 30);
  assert.ok(result.findings.some((finding) => finding.code === "insecure-http"));
});

test("flags a brand hidden in a subdomain", () => {
  const result = analyzeUrl("https://paypal.example.net/login");
  assert.ok(result.findings.some((finding) => finding.code === "brand-in-subdomain"));
});

test("flags IP hosts, punycode, encoded delimiters and unusual ports", () => {
  assert.ok(analyzeUrl("http://192.0.2.10/login").findings.some((f) => f.code === "ip-host"));
  assert.ok(analyzeUrl("https://xn--pple-43d.com").findings.some((f) => f.code === "punycode"));
  assert.ok(analyzeUrl("https://example.com/%2Fadmin").findings.some((f) => f.code === "encoded-structure"));
  assert.ok(analyzeUrl("https://example.com:8443").findings.some((f) => f.code === "unusual-port"));
});

test("returns a safe validation result for malformed and unsupported input", () => {
  assert.equal(analyzeUrl("http://[broken").isValid, false);
  assert.equal(analyzeUrl("javascript:alert(1)").isValid, false);
  assert.equal(analyzeUrl("").isValid, false);
});

test("extracts unique HTTP(S) links from email text", () => {
  assert.deepEqual(
    extractUrls("Visit https://example.com/a. Then https://example.com/a."),
    ["https://example.com/a"]
  );
});


test("correctly identifies registrable domains with .co.nz suffix", () => {
  const result = analyzeUrl("https://paypa1-secure.co.nz");

  assert.equal(result.registrableDomain, "paypa1-secure.co.nz");
  assert.ok(
    result.findings.some((finding) => finding.code === "brand-lookalike")
  );
  assert.ok(
    !result.findings.some((finding) => finding.code === "brand-in-subdomain")
  );
});

test("correctly identifies brands in subdomains with multi-part suffixes", () => {
  const result = analyzeUrl("https://paypal.fakewebsite.co.nz");

  assert.equal(result.registrableDomain, "fakewebsite.co.nz");
  assert.ok(
    result.findings.some((finding) => finding.code === "brand-in-subdomain")
  );
});

test("supports other multi-part public suffixes", () => {
  const ukResult = analyzeUrl("https://example.co.uk");
  const auResult = analyzeUrl("https://example.com.au");

  assert.equal(ukResult.registrableDomain, "example.co.uk");
  assert.equal(auResult.registrableDomain, "example.com.au");
});

test("handles single-label domains and raw IP addresses", () => {
  const localhostResult = analyzeUrl("http://localhost");
  const ipResult = analyzeUrl("http://192.0.2.10");

  // Single-label domains are rejected by the existing validator.
  assert.equal(localhostResult.isValid, false);

  // Raw IP addresses are accepted and correctly identified.
  assert.equal(ipResult.isValid, true);
  assert.equal(ipResult.registrableDomain, "192.0.2.10");
  assert.ok(ipResult.findings.some((f) => f.code === "ip-host"));
});