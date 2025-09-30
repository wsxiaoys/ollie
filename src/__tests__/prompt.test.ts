import { test, expect } from "bun:test";
import { buildPrompt } from "../prompt";

test("buildPrompt with custom checklist", () => {
  const url = "https://custom-example.com";
  const customChecklist = `
1. Custom Criteria 1 (0-50 points): Custom evaluation criteria
2. Custom Criteria 2 (0-50 points): Another custom criteria
`.trim();
  
  const result = buildPrompt(url, customChecklist);
  
  expect(result).toMatchSnapshot();
});