import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";

const nextCoreWebVitals = nextPlugin.configs["core-web-vitals"] ?? {};
const nextLanguageOptions = nextCoreWebVitals.languageOptions ?? {};
const nextRules = nextCoreWebVitals.rules ?? {};
const nextSettings = nextCoreWebVitals.settings ?? {};

export default tseslint.config(
  {
    ignores: [
      "dist",
      ".next",
      "eslint.config.js",
      "next.config.mjs",
      "postcss.config.js",
      "next-env.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ...nextLanguageOptions,
      globals: {
        ...(nextLanguageOptions.globals ?? {}),
        ...globals.browser,
      },
    },
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooks,
    },
    settings: nextSettings,
    rules: {
      ...nextRules,
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": "off",
      "@next/next/no-img-element": "off",
    },
  },
);
