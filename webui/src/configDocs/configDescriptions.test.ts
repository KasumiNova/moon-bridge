import { describe, expect, test } from "vitest";
import { configDescriptions, requiredConfigPaths } from "./configDescriptions";

describe("configDescriptions", () => {
  test("documents all required first-pass config paths in both languages", () => {
    for (const path of requiredConfigPaths) {
      const entry = configDescriptions[path];

      expect(entry, path).toBeDefined();
      expect(entry.title["en-US"], path).toBeTruthy();
      expect(entry.title["zh-CN"], path).toBeTruthy();
      expect(entry.description["en-US"], path).toBeTruthy();
      expect(entry.description["zh-CN"], path).toBeTruthy();
    }
  });

  test("marks secret-bearing fields as sensitive", () => {
    expect(configDescriptions["server.auth_token"].sensitive).toBe(true);
    expect(configDescriptions["providers.<key>.api_key"].sensitive).toBe(true);
    expect(configDescriptions["web_search.tavily_api_key"].sensitive).toBe(true);
    expect(configDescriptions["web_search.firecrawl_api_key"].sensitive).toBe(true);
  });
});
