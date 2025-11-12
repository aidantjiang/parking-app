import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  // Force Vitest to treat this folder (with space in name) as the project root
  root: __dirname,
  test: {
    environment: "jsdom",
    // Resolve to absolute path so Vitest doesn't drop "Christian's UI" segment
    setupFiles: path.resolve(__dirname, "vitest.setup.ts"),
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  esbuild: {
    // Align with Next.js automatic JSX runtime so tests don't require React in scope
    jsx: "automatic",
  },
});
