import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  server: { port: 8080 },
  preview: { port: 8080 },

  test: {
    environment: "happy-dom",
    globals: true,
    include: ["tests/**/*.spec.js"],
    setupFiles: ["tests/setup.js"],
    restoreMocks: true,
    unstubGlobals: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{js,vue}"],
      exclude: ["src/main.js", "src/api/demoFixtures.js"],
    },
  },
});
