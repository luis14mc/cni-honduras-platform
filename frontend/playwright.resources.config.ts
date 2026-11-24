import { defineConfig } from "@playwright/test";

const fixture = "http://127.0.0.1:4327";
const frontend = "http://localhost:4328";

export default defineConfig({
  testDir: "./e2e",
  testMatch: ["**/resource-downloads.spec.ts", "**/public-journeys.spec.ts", "**/investment-map.spec.ts"],
  timeout: 60_000,
  use: { baseURL: frontend, channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL, trace: "retain-on-failure" },
  webServer: [
    { command: "node e2e/fixtures/resource-download-server.mjs", url: `${fixture}/health` },
    {
      command: "pnpm run dev --hostname localhost --port 4328",
      url: frontend,
      timeout: 120_000,
      env: { STRAPI_URL: fixture, NEXT_PUBLIC_API_URL: `${fixture}/api/v1` },
    },
  ],
});
