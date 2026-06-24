/**
 * Minimal eslint.config.js for sonar-quality-gate plugin.
 * Copy this to your project root as eslint.config.js if you don't already have one.
 *
 * Requires: npm install --save-dev eslint eslint-plugin-sonarjs
 */
import sonarjs from "eslint-plugin-sonarjs";
import globals from "globals";

export default [
  {
    ignores: ["dist", "node_modules"],
  },
  sonarjs.configs.recommended,
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "sonarjs/cognitive-complexity": ["error", 15],
      "sonarjs/no-duplicated-branches": "error",
      "sonarjs/no-identical-functions": "error",
      "sonarjs/no-redundant-boolean": "error",
      "sonarjs/no-small-switch": "error",
      "sonarjs/no-commented-code": "error",
    },
  },
];
