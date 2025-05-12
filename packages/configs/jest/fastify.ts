import type { Config } from "jest";
import { config as baseConfig } from "./base";

export const config = {
  ...baseConfig,
  collectCoverageFrom: [
    ...baseConfig.collectCoverageFrom,
    "!src/routes.ts",
    "!src/server.ts",
  ],
} as const satisfies Config;
