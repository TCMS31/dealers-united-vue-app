import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

/**
 * Vitest runs the unit suite. The application itself is still built by Vue CLI
 * (webpack); Vitest only needs its own transform pipeline for `.vue` files and
 * the same `@/` alias the app uses.
 */
export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  test: {
    environment: "happy-dom",
    globals: true,
    include: ["tests/**/*.spec.js"],
    setupFiles: ["tests/setup.js"],
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{js,vue}"],
      exclude: ["src/main.js", "src/api/demoFixtures.js"],
    },
  },
});
