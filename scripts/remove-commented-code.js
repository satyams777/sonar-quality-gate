#!/usr/bin/env node
/**
 * Removes lines flagged by sonarjs/no-commented-code from the target file.
 * Usage: node remove-commented-code.js <file-or-dir>
 * If a directory is given, ESLint scans it; if a file is given, only that file is checked.
 */
const { execSync } = require("child_process");
const { readFileSync, writeFileSync } = require("fs");

const target = process.argv[2] ?? "src";

let jsonOutput;
try {
  jsonOutput = execSync(`npx --no-install eslint "${target}" --format json`, {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  });
} catch (err) {
  // ESLint exits non-zero when violations exist; stdout still contains the JSON report
  jsonOutput = err.stdout || "[]";
}

let files;
try {
  files = JSON.parse(jsonOutput);
} catch {
  console.error("[sonar-quality-gate] Failed to parse ESLint JSON output.");
  process.exit(0);
}

let totalRemoved = 0;

for (const file of files) {
  const issues = file.messages.filter(
    (m) => m.ruleId === "sonarjs/no-commented-code"
  );
  if (issues.length === 0) continue;

  const lines = readFileSync(file.filePath, "utf-8").split("\n");

  const toRemove = new Set();
  for (const issue of issues) {
    const start = issue.line - 1;
    const end = (issue.endLine ?? issue.line) - 1;
    for (let l = start; l <= end; l++) toRemove.add(l);
  }

  const cleaned = lines.filter((_, i) => !toRemove.has(i));
  writeFileSync(file.filePath, cleaned.join("\n"), "utf-8");

  console.log(
    `[sonar-quality-gate] Removed ${toRemove.size} commented-code line(s) from ${file.filePath}`
  );
  totalRemoved += toRemove.size;
}

if (totalRemoved === 0) {
  console.log("[sonar-quality-gate] No commented-out code found.");
}
