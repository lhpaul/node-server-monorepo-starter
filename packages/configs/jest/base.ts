import type { Config } from "jest";

export const config = {
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/index.ts",
    "!src/**/*.d.ts",
    "!src/**/*.constants.ts",
    "!src/**/*.mocks.ts",
    "!src/**/*.interfaces.ts",
    "!src/**/*.types.ts"
  ],
  coverageDirectory: "coverage",
  coverageProvider: "babel",
  extensionsToTreatAsEsm: [".ts"],
  moduleFileExtensions: ["js", "ts", "json"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  preset: "ts-jest/presets/js-with-ts-esm",
  roots: ["<rootDir>/src"],
  testEnvironment: "node",
  testMatch: ["**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
} as const satisfies Config;
