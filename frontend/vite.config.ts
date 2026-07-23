import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

const integrationDist = resolve(
  import.meta.dirname,
  "../custom_components/intelligent_load_controller/frontend/dist",
);

export default defineConfig({
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    target: "es2022",
    outDir: integrationDist,
    emptyOutDir: true,
    sourcemap: false,
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      formats: ["es"],
      fileName: () => "intelligent-load-controller.js",
    },
    rollupOptions: {
      output: {
        codeSplitting: false,
        entryFileNames: "intelligent-load-controller.js",
        assetFileNames: "intelligent-load-controller.[ext]",
      },
    },
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.ts"],
    restoreMocks: true,
    setupFiles: ["tests/setup.ts"],
  },
});
