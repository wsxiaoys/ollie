#!/usr/bin/env bun

import { spawn } from "node:child_process";
import process from "node:process";
import { Command } from "@commander-js/extra-typings";
import { buildPrompt } from "./prompt";

// Manually parse arguments to handle -- separator
const separatorIndex = process.argv.indexOf("--");
const ollieArgs = separatorIndex === -1 ? process.argv : process.argv.slice(0, separatorIndex);
const pochiArgs = separatorIndex === -1 ? [] : process.argv.slice(separatorIndex + 1);

const program = new Command()
  .name("ollie")
  .description("Spawn a pochi subprocess with a web URL prompt")
  .requiredOption("-u, --url <url>", "Web URL to evaluate")
  .requiredOption("-q, --question <text>", "Original question/task that led to creating the sourceDir/url")
  .requiredOption("-d, --dir <path>", "Source code directory to evaluate", process.cwd())
  .action(async (options) => {
    try {
      const exitCode = await runPochi(options.url, options.dir, options.question, pochiArgs);
      process.exit(exitCode);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("Unknown error while running pochi");
      }

      process.exit(1);
    }
  });


await program.parseAsync(ollieArgs);

async function runPochi(url: string, sourceDir: string, question: string, pochiArgs: string[]): Promise<number> {
  const instructions = buildPrompt(url, sourceDir, undefined, question);
  return new Promise((resolve, reject) => {
    const child = spawn("pochi", pochiArgs, {
      stdio: ["pipe", "inherit", "inherit"],
      env: {
        PATH: process.env.PATH,
        POCHI_CUSTOM_INSTRUCTIONS: instructions,
      }
    });

    child.on("error", (error) => {
      reject(new Error(`Failed to start pochi: ${error.message}`));
    });

    child.stdin.write(`Please start evaluation\n`);
    child.stdin.end();

    child.on("close", (code, signal) => {
      if (signal) {
        reject(new Error(`pochi terminated with signal ${signal}`));
        return;
      }

      resolve(code ?? 0);
    });
  });
}
