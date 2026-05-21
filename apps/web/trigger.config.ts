import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_mldzlcgtedlujwcvwlij",
  runtime: "node",
  logLevel: "warn",
  // The max compute duration for this project.
  maxDuration: 3600, 
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["./src/trigger"],
});
