import eslintPluginJsxA11y from "eslint-plugin-jsx-a11y";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import eslintPluginReactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import typescriptEslint from "typescript-eslint";
import js from "@eslint/js";

export default typescriptEslint.config(
  {
    ignores: ["dist", "dist", "**/mockServiceWorker.js"],
  },
  {
    extends: [
      js.configs.recommended,
      ...typescriptEslint.configs.recommended,
      eslintPluginPrettierRecommended,
      eslintPluginJsxA11y.flatConfigs.recommended,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": eslintPluginReactHooks,
      "react-refresh": eslintPluginReactRefresh,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
      "prettier/prettier": "warn",
      "prefer-const": ["error", { destructuring: "all" }],
      "@typescript-eslint/no-unused-vars": ["warn", { caughtErrors: "none" }],
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/consistent-type-imports": "error",
      "react-refresh/only-export-components": ["off"],
      "jsx-a11y/no-noninteractive-tabindex": ["error", { tags: ["pre"] }],
    },
  },
);
