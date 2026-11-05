import test from "node:test";
import assert from "node:assert/strict";
import { buildIncidentTimeline } from "./incidentAnalysis.js";

test("sorts events in chronological order", () => {
  const events = [
    { id: "event-003", timestamp: "2026-10-15T09:30:00Z" },
    { id: "event-001", timestamp: "2026-10-15T09:00:00Z" },
    { id: "event-002", timestamp: "2026-10-15T09:15:00Z" },
  ];

  const result = buildIncidentTimeline(events);

  assert.deepEqual(
    result.map((event) => event.id),
    ["event-001", "event-002", "event-003"]
  );
});

test("ignores events with invalid timestamps", () => {
  const events = [
    { id: "event-001", timestamp: "invalid-date" },
    { id: "event-002", timestamp: "2026-10-15T09:00:00Z" },
  ];

  const result = buildIncidentTimeline(events);

  assert.deepEqual(
    result.map((event) => event.id),
    ["event-002"]
  );
});

test("does not modify the original events array", () => {
  const events = [
    { id: "event-002", timestamp: "2026-10-15T09:15:00Z" },
    { id: "event-001", timestamp: "2026-10-15T09:00:00Z" },
  ];

  buildIncidentTimeline(events);

  assert.equal(events[0].id, "event-002");
});

test("returns an empty array for invalid input", () => {
  assert.deepEqual(buildIncidentTimeline(null), []);
});