#!/usr/bin/env bun

import { spawn } from "node:child_process";
import process from "node:process";
import { Command } from "@commander-js/extra-typings";
import { InvalidArgumentError } from "commander";

const program = new Command()
  .name("ollie")
  .description("Spawn a pochi subprocess with a web URL prompt")
  .argument("[url]", "Web URL to evaluate", (value) => {
    let parsed: URL;

    try {
      parsed = new URL(value);
    } catch {
      throw new InvalidArgumentError("URL must be a valid absolute URL");
    }

    return parsed.toString();
  })
  .action(async (url) => {

    if (!url) {
      return program.help({ error: false });
    }

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
  return new Promise((resolve, reject) => {
    const child = spawn("pochi", {
      stdio: ["pipe", "inherit", "inherit"],
      env: process.env,
    });

    child.on("error", (error) => {
      reject(new Error(`Failed to start pochi: ${error.message}`));
    });

    child.stdin.write(`${url}\n`);
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
