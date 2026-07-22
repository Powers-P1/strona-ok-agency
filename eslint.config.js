import eslint from "@eslint/js";
import typescriptParser from "@typescript-eslint/parser";
import astro from "eslint-plugin-astro";

export default [
  {
    ignores: [".astro/**", "dist/**", "node_modules/**", "playwright-report/**", "test-results/**"],
  },
  eslint.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: typescriptParser,
    },
  },
  {
    files: ["**/*.astro", "src/**/*.ts"],
    languageOptions: {
      globals: {
        CustomEvent: "readonly",
        Document: "readonly",
        HTMLElement: "readonly",
        HTMLButtonElement: "readonly",
        IntersectionObserver: "readonly",
        MediaQueryList: "readonly",
        document: "readonly",
        navigator: "readonly",
        window: "readonly",
      },
    },
  },
  {
    files: ["playwright.config.ts", "tests/**/*.ts"],
    languageOptions: {
      globals: {
        document: "readonly",
        getComputedStyle: "readonly",
        process: "readonly",
      },
    },
  },
];
