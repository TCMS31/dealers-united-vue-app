import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  { ignores: ["dist/", "coverage/", "node_modules/", "project_venv/"] },

  js.configs.recommended,
  ...pluginVue.configs["flat/recommended"],

  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser },
    },
    rules: {
      "no-console": "warn",
      "no-debugger": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      eqeqeq: ["error", "smart"],
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": ["error", "properties"],
      "vue/component-name-in-template-casing": ["error", "PascalCase"],
      "vue/no-unused-refs": "error",
    },
  },

  {
    // The root component is `App` by convention; a multi-word name would only
    // make every import noisier.
    files: ["src/App.vue"],
    rules: { "vue/multi-word-component-names": "off" },
  },

  {
    files: ["tests/**/*.js", "*.config.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        vi: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },
  },

  // Must stay last: turns off every rule Prettier already owns.
  prettier,
];
