import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  sortNewest,
  filterByCategory,
  validateNews,
} from "./news.js";

const articles = [
  {
    id: 1,
    title: "Article 1",
    date: "2026-11-01",
    category: "Malware",
  },
  {
    id: 2,
    title: "Article 2",
    date: "2026-11-04",
    category: "Data Breach",
  },
  {
    id: 3,
    title: "Article 3",
    date: "2026-11-02",
    category: "Malware",
  },
];

describe("News utilities", () => {
  it("sorts articles by newest date", () => {
    const result = sortNewest(articles);

    assert.deepEqual(
      result.map((a) => a.id),
      [2, 3, 1]
    );
  });

  it("does not modify original array when sorting", () => {
    const original = [...articles];

    sortNewest(articles);

    assert.deepEqual(articles, original);
  });

  it("filters articles by category", () => {
    const result = filterByCategory(articles, "Malware");

    assert.equal(result.length, 2);
  });

  it("returns all articles for All category", () => {
    const result = filterByCategory(articles, "All");

    assert.equal(result.length, 3);
  });

  it("validates a complete news article", () => {
    const article = {
      id: 1,
      title: "Test",
      snippet: "Test description",
      source: "Test Source",
      url: "https://example.com",
      date: "2026-11-04",
      category: "Malware",
    };

    assert.equal(validateNews(article), true);
  });

  it("rejects incomplete news articles", () => {
    assert.equal(
      validateNews({ id: 1, title: "Incomplete" }),
      false
    );
  });
});