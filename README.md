# sonar-quality-gate

A Claude Code plugin that enforces a SonarJS quality gate automatically after every file edit. It removes commented-out code, auto-fixes ESLint violations, and blocks Claude from continuing if unfixable issues remain — keeping your JS/TS codebase clean without any manual effort.

## What it does

Every time Claude writes or edits a `.js`, `.jsx`, `.ts`, or `.tsx` file:

1. **Strips commented-out code** — runs `sonarjs/no-commented-code` and removes flagged lines automatically
2. **Auto-fixes ESLint violations** — runs `eslint --fix` for everything fixable
3. **Blocks on unfixable issues** — exits with a non-zero code so Claude sees the violation and must fix it before moving on

## Requirements

Your project must have:

- `eslint` (v9+) installed
- `eslint-plugin-sonarjs` installed
- An `eslint.config.js` (flat config) in the project root

```bash
npm install --save-dev eslint eslint-plugin-sonarjs
```

A minimal `eslint.config.js` is provided in `config/eslint.config.example.js` — copy it to your project root to get started.

## Installation

```
/plugin install sonar-quality-gate
```

Once installed, the hook activates automatically for every project. No per-project configuration needed.

## Slash command

Run a manual scan at any time:

```
/sonar-quality-gate src/App.jsx
```

Omit the path to scan the whole project:

```
/sonar-quality-gate
```

## Rules enforced (defaults)

| Rule | Description |
|------|-------------|
| `sonarjs/no-commented-code` | Removes commented-out code blocks |
| `sonarjs/cognitive-complexity` | Flags functions with complexity > 15 |
| `sonarjs/no-duplicated-branches` | Flags identical if/else branches |
| `sonarjs/no-identical-functions` | Flags duplicate function implementations |
| `sonarjs/no-redundant-boolean` | Flags unnecessary boolean literals |
| `sonarjs/no-small-switch` | Flags switch with fewer than 3 cases |

You control which rules are active via your project's `eslint.config.js` — the plugin just triggers the check.

## How it works

The plugin registers a `PostToolUse` hook that fires after every `Edit`, `Write`, or `MultiEdit` tool call. The hook:

1. Reads the file path from the tool input
2. Skips non-JS/TS files and files outside the project directory
3. Runs `remove-commented-code.js` → `eslint --fix` → final `eslint` check
4. Returns exit code `2` to block Claude and surface the violation output if issues remain

## License

MIT
