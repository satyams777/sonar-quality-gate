---
description: Run SonarJS quality gate on a file or the entire project
argument-hint: Optional file path (e.g. src/App.jsx) — omit to scan the whole project
allowed-tools: ["Bash", "Read"]
---

# SonarJS Quality Gate Check

Run a full SonarJS quality gate check on the specified file, or on the entire project if no file is given.

## Steps

### 1. Determine target

- If `$ARGUMENTS` is provided, use it as the file path target.
- If `$ARGUMENTS` is empty, use `src` (or the project source directory).

### 2. Remove commented-out code

Use the Bash tool to run:
```bash
cd "$CLAUDE_PROJECT_DIR" && node "${CLAUDE_PLUGIN_ROOT}/scripts/remove-commented-code.js" <target>
```

### 3. Auto-fix ESLint issues

```bash
cd "$CLAUDE_PROJECT_DIR" && npx eslint <target> --fix
```

### 4. Report remaining violations

```bash
cd "$CLAUDE_PROJECT_DIR" && npx eslint <target>
```

### 5. Summarize results

- If no violations remain: report "All checks passed."
- If violations remain: list each file, rule ID, line number, and message. Ask the user if they want you to fix them.
