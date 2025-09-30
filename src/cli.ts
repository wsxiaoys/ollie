#!/usr/bin/env bun

import { spawn } from "node:child_process";
import process from "node:process";
import { Command } from "@commander-js/extra-typings";
import { buildPrompt } from "./prompt";

const program = new Command()
  .name("ollie")
  .description("Spawn a pochi subprocess with a web URL prompt")
  .argument("<url>", "Web URL to evaluate")
  .action(async (url) => {
    try {
      const exitCode = await runPochi(url);
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


await program.parseAsync(process.argv);

async function runPochi(url: string): Promise<number> {
  const instructions = buildPrompt(url);
  return new Promise((resolve, reject) => {
    const child = spawn("pochi", {
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
