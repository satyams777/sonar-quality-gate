#!/bin/bash
# PostToolUse hook — runs SonarJS quality gate on every edited JS/TS/JSX/TSX file.
# Exits 2 to block Claude and surface the violation message when unfixable issues remain.

INPUT=$(cat)

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# MultiEdit passes an array of edits; derive the unique file from the first entry
if [[ -z "$FILE_PATH" ]]; then
  FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.edits[0].file_path // empty' 2>/dev/null)
fi

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

if [[ ! "$FILE_PATH" =~ \.(js|jsx|ts|tsx)$ ]]; then
  exit 0
fi

# Resolve the project root: use $CLAUDE_PROJECT_DIR if set, otherwise walk up from the file
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-}"
if [[ -z "$PROJECT_DIR" ]]; then
  PROJECT_DIR=$(dirname "$FILE_PATH")
  while [[ "$PROJECT_DIR" != "/" ]]; do
    [[ -f "$PROJECT_DIR/package.json" ]] && break
    PROJECT_DIR=$(dirname "$PROJECT_DIR")
  done
fi

if [[ ! -f "$PROJECT_DIR/package.json" ]]; then
  echo "[sonar-quality-gate] No package.json found — skipping quality gate."
  exit 0
fi

# Check that eslint-plugin-sonarjs is available in this project
if ! (cd "$PROJECT_DIR" && node -e "require('eslint-plugin-sonarjs')" 2>/dev/null); then
  echo "[sonar-quality-gate] eslint-plugin-sonarjs not found in $PROJECT_DIR."
  echo "Run: npm install --save-dev eslint-plugin-sonarjs"
  exit 0
fi

echo "[sonar-quality-gate] Checking: $FILE_PATH"

# Step 1 — strip commented-out code blocks (sonarjs/no-commented-code)
(cd "$PROJECT_DIR" && node "${CLAUDE_PLUGIN_ROOT}/scripts/remove-commented-code.js" "$FILE_PATH")

# Step 2 — auto-fix anything ESLint can fix
(cd "$PROJECT_DIR" && npx --no-install eslint "$FILE_PATH" --fix 2>/dev/null)

# Step 3 — final check; exit 2 blocks Claude and surfaces the output
(cd "$PROJECT_DIR" && npx --no-install eslint "$FILE_PATH")
ESLINT_EXIT=$?

if [[ $ESLINT_EXIT -ne 0 ]]; then
  echo ""
  echo "[sonar-quality-gate] Unfixable violations remain in $FILE_PATH"
  echo "Fix the issues above before continuing."
  exit 2
fi

echo "[sonar-quality-gate] OK — $FILE_PATH passed all checks."
exit 0
