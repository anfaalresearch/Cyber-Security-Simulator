import test from "node:test";
import assert from "node:assert/strict";
import { correlateEvents } from "./eventCorrelation.js";

const events = [
  {
    id: "event-001",
    timestamp: "2026-10-15T09:00:00Z",
    user: "alex.morgan",
    ip: "192.0.2.10",
  },
  {
    id: "event-002",
    timestamp: "2026-10-15T09:15:00Z",
    user: "alex.morgan",
    ip: "198.51.100.25",
  },
  {
    id: "event-003",
    timestamp: "2026-10-15T09:18:00Z",
    user: "alex.morgan",
    ip: "198.51.100.25",
  },
];

test("correlates events involving the same user", () => {
  const result = correlateEvents(events);

  assert.ok(
    result.some(
      (item) =>
        item.eventIds.includes("event-001") &&
        item.eventIds.includes("event-002") &&
        item.reasons.includes("Same user account")
    )
  );
});

test("correlates events involving the same IP address", () => {
  const result = correlateEvents(events);

  assert.ok(
    result.some(
      (item) =>
        item.eventIds.includes("event-002") &&
        item.eventIds.includes("event-003") &&
        item.reasons.includes("Same IP address")
    )
  );
});

test("does not correlate events outside the time window", () => {
  const result = correlateEvents([
    events[0],
    {
      ...events[1],
      timestamp: "2026-10-15T12:00:00Z",
    },
  ]);

  assert.equal(result.length, 0);
});

test("ignores events with invalid timestamps", () => {
  const result = correlateEvents([
    events[0],
    { ...events[1], timestamp: "invalid-date" },
  ]);

  assert.equal(result.length, 0);
});

test("returns an empty array for invalid input", () => {
  assert.deepEqual(correlateEvents(null), []);
});

test("correlates events correctly when timestamps are out of order", () => {
  const result = correlateEvents([
    {
      id: "later-event",
      timestamp: "2026-10-15T09:20:00Z",
      user: "alex.morgan",
      ip: "192.0.2.10",
    },
    {
      id: "earlier-event",
      timestamp: "2026-10-15T09:05:00Z",
      user: "alex.morgan",
      ip: "192.0.2.20",
    },
  ]);

  assert.equal(result.length, 1);
  assert.ok(result[0].reasons.includes("Same user account"));
  assert.equal(result[0].timeDifferenceMinutes, 15);
});

test("correlates multiple events sharing the same IP address", () => {
  const result = correlateEvents([
    {
      id: "ip-1",
      timestamp: "2026-10-15T09:00:00Z",
      user: "user.one",
      ip: "198.51.100.50",
    },
    {
      id: "ip-2",
      timestamp: "2026-10-15T09:05:00Z",
      user: "user.two",
      ip: "198.51.100.50",
    },
    {
      id: "ip-3",
      timestamp: "2026-10-15T09:10:00Z",
      user: "user.three",
      ip: "198.51.100.50",
    },
  ]);

  assert.equal(result.length, 3);

  assert.ok(
    result.every((item) =>
      item.reasons.includes("Same IP address")
    )
  );
});

test("does not correlate unrelated background noise events", () => {
  const result = correlateEvents([
    {
      id: "related-1",
      timestamp: "2026-10-15T09:00:00Z",
      user: "alex.morgan",
      ip: "192.0.2.10",
    },
    {
      id: "related-2",
      timestamp: "2026-10-15T09:05:00Z",
      user: "alex.morgan",
      ip: "192.0.2.20",
    },
    {
      id: "noise-1",
      timestamp: "2026-10-15T09:06:00Z",
      user: "background.service",
      ip: "203.0.113.50",
    },
    {
      id: "noise-2",
      timestamp: "2026-10-15T09:08:00Z",
      user: "monitoring.service",
      ip: "203.0.113.60",
    },
  ]);

  assert.equal(result.length, 1);
  assert.deepEqual(result[0].eventIds, ["related-1", "related-2"]);
});