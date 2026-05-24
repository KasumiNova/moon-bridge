import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/console/",
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://127.0.0.1:38440",
      "/v1": "http://127.0.0.1:38440",
      "/responses": "http://127.0.0.1:38440",
      "/models": "http://127.0.0.1:38440"
    }
  },
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "http://127.0.0.1:5173/console/"
      }
    },
    globals: true,
    setupFiles: "./src/test/setup.ts"
  }
});
