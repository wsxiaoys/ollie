#!/usr/bin/env bun

import * as fs from "node:fs/promises";
import * as path from "node:path";
import { findRelevantChecklist } from "../find-checklist";

// Test the function
const testQuestion = "You are a code expert. Please use your professional knowledge to generate accurate and professional responses. Be sure to ensure the generated code is executable and demonstrable. Help me write a software for analyzing grain and oil futures on a six-month cycle that can obtain real-time trading information and policies for domestic grain and oil products. The data should be sourced from the National Grain Trade Center and GrainOil Duoduo. Ideally, it should integrate with AI large models. Please write all the code for the entire project.";
const libraryDir = path.join(import.meta.dir, "../../library");

console.log(`Testing checklist finder with question: "${testQuestion}"\n`);

const result = await findRelevantChecklist(testQuestion, libraryDir);

if (result) {
  console.log(`\nFound ${result.length} checklist items`);
  console.log(JSON.stringify(result, null, 2))
} else {
  console.log("\nNo checklist found");
}

