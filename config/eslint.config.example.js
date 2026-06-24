import sonarjs from "eslint-plugin-sonarjs";
import globals from "globals";

export default [
  {
    ignores: ["dist", "node_modules", "coverage", "build", "*.min.js"],
  },
  sonarjs.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Complexity
      "sonarjs/cognitive-complexity": ["error", 15],

      // Bugs & logic errors
      "sonarjs/no-all-duplicated-branches": "error",
      "sonarjs/no-duplicated-branches": "error",
      "sonarjs/no-identical-conditions": "error",
      "sonarjs/no-identical-functions": "error",
      "sonarjs/no-ignored-return": "error",
      "sonarjs/no-use-of-empty-return-value": "error",

      // Code smells
      "sonarjs/no-commented-code": "error",
      "sonarjs/no-redundant-boolean": "error",
      "sonarjs/no-small-switch": "error",
      "sonarjs/prefer-immediate-return": "error",
      "sonarjs/no-inverted-boolean-check": "error",
      "sonarjs/no-nested-template-literals": "warn",
      "sonarjs/no-collapsible-if": "warn",
    },
  },
];
