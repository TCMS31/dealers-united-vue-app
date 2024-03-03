module.exports = {
  root: true,

  env: {
    browser: true,
    es2021: true,
    node: true,
  },

  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    // Must stay last: turns off every rule Prettier already owns.
    "prettier",
  ],

  parserOptions: {
    parser: "@babel/eslint-parser",
    ecmaVersion: 2022,
    sourceType: "module",
    requireConfigFile: false,
  },

  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    eqeqeq: ["error", "smart"],
    "prefer-const": "error",
    "no-var": "error",
    "object-shorthand": ["error", "properties"],
    "vue/component-name-in-template-casing": ["error", "PascalCase"],
    "vue/no-unused-refs": "error",
  },

  overrides: [
    {
      // The root component is `App` by convention; a multi-word name would only
      // make every import noisier.
      files: ["src/App.vue"],
      rules: { "vue/multi-word-component-names": "off" },
    },
    {
      files: ["tests/**/*.js", "vitest.config.js"],
      env: { node: true },
      globals: {
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
  ],
};
