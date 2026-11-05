import test from "node:test";
import assert from "node:assert/strict";
import {
  buildAdjacencyList,
  calculateNodeRisk,
  calculatePathRisk,
  explainAttackPath,
  findAttackPaths,
  findCycles,
  findDisconnectedNodes,
  rankCriticalNodes,
  validateAttackGraph,
} from "./attackPathEngine.js";

const node = (id, type, overrides = {}) => ({
  id, name: id, type, severity: 5, exploitability: 5, assetImpact: 5, ...overrides,
});
const graph = (nodes, edges) => ({ nodes, edges });

test("finds a multi-stage entry-to-asset path", () => {
  const sample = graph(
    [node("entry", "entry"), node("weakness", "vulnerability"), node("exploit", "technique"), node("db", "asset")],
    [{ from: "entry", to: "weakness" }, { from: "weakness", to: "exploit" }, { from: "exploit", to: "db" }]
  );
  assert.deepEqual(findAttackPaths(sample), [["entry", "weakness", "exploit", "db"]]);
});

test("detects cycles without allowing path traversal to loop forever", () => {
  const sample = graph(
    [node("entry", "entry"), node("weakness", "vulnerability"), node("exploit", "technique"), node("db", "asset")],
    [{ from: "entry", to: "weakness" }, { from: "weakness", to: "exploit" }, { from: "exploit", to: "weakness" }, { from: "exploit", to: "db" }]
  );
  assert.equal(findCycles(sample).length, 1);
  assert.equal(findAttackPaths(sample).length, 1);
});

test("reports disconnected nodes and isolated graphs", () => {
  const sample = graph(
    [node("entry", "entry"), node("asset", "asset"), node("isolated", "vulnerability")],
    [{ from: "entry", to: "asset" }]
  );
  assert.deepEqual(findDisconnectedNodes(sample), ["isolated"]);
  assert.deepEqual(findDisconnectedNodes(graph([node("isolated", "asset")], [])), ["isolated"]);
});

test("deduplicates repeated edges during traversal and reports them", () => {
  const sample = graph(
    [node("entry", "entry"), node("weakness", "vulnerability")],
    [{ from: "entry", to: "weakness" }, { from: "entry", to: "weakness" }]
  );
  assert.deepEqual(buildAdjacencyList(sample).get("entry"), ["weakness"]);
  assert.ok(validateAttackGraph(sample).some((issue) => issue.code === "duplicate-edge"));
});

test("rejects invalid transitions and unknown endpoints", () => {
  const sample = graph(
    [node("entry", "entry"), node("asset", "asset")],
    [{ from: "asset", to: "entry" }, { from: "entry", to: "missing" }]
  );
  const codes = validateAttackGraph(sample).map((issue) => issue.code);
  assert.ok(codes.includes("invalid-transition"));
  assert.ok(codes.includes("unknown-edge-node"));
  assert.deepEqual(findAttackPaths(sample), []);
});

test("calculates bounded node and path risk scores", () => {
  const sample = graph([node("entry", "entry", { severity: 10, exploitability: 10, assetImpact: 10 }), node("db", "asset", { assetImpact: 10 })], []);
  assert.equal(calculateNodeRisk(sample.nodes[0]), 100);
  assert.equal(calculatePathRisk(["entry", "db"], sample), 89);
  assert.equal(calculateNodeRisk(null), 0);
});

test("ranks critical nodes and explains the attack path", () => {
  const sample = graph(
    [node("entry", "entry"), node("weakness", "vulnerability", { severity: 9 }), node("db", "asset", { assetImpact: 10 })],
    [{ from: "entry", to: "weakness" }, { from: "weakness", to: "db" }]
  );
  assert.equal(rankCriticalNodes(sample)[0].id, "db");
  assert.match(explainAttackPath(["entry", "weakness", "db"], sample), /Customer|db/);
});

test("returns no paths when there is no entry node", () => {
  const sample = graph([node("weakness", "vulnerability"), node("db", "asset")], []);
  assert.deepEqual(findAttackPaths(sample), []);
  assert.deepEqual(findDisconnectedNodes(sample), ["weakness", "db"]);
});

test("continues through a compromised asset to discover a second asset", () => {
  const sample = graph(
    [node("entry", "entry"), node("weakness", "vulnerability"), node("server", "asset"), node("pivot", "technique"), node("database", "asset")],
    [{ from: "entry", to: "weakness" }, { from: "weakness", to: "server" }, { from: "server", to: "pivot" }, { from: "pivot", to: "database" }]
  );
  assert.deepEqual(findAttackPaths(sample), [
    ["entry", "weakness", "server"],
    ["entry", "weakness", "server", "pivot", "database"],
  ]);
});

test("handles an empty graph without throwing", () => {
  const empty = graph([], []);
  assert.deepEqual(findAttackPaths(empty), []);
  assert.deepEqual(findCycles(empty), []);
  assert.deepEqual(findDisconnectedNodes(empty), []);
  assert.deepEqual(validateAttackGraph(empty), []);
});
