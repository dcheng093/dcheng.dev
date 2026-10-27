/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Project lives on /mnt/c under WSL2: inotify misses edits, so poll.
    watch: {
      usePolling: true,
      ignored: ["**/asset-research/**", "**/test-results/**", "**/playwright-report/**", "**/.cache/**"],
    },
  },
  optimizeDeps: { entries: ["index.html"] },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
