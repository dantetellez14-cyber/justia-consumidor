import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    // MSW-generated service worker — not project code
    "public/mockServiceWorker.js",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Python venv contains minified JS from playwright/patchright packages
    "scripts/python/venv/**",
    // Git worktrees used by internal agents — not part of the main codebase
    ".claude/worktrees/**",
    // Coverage reports contain instrumented/generated JS
    "coverage/**",
  ]),
]);

export default eslintConfig;
