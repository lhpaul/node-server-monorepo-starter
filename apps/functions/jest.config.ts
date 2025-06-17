import { config as baseConfig } from '@repo/configs/jest/base';

export default {
  ...baseConfig,
  collectCoverageFrom: [
    ...baseConfig.collectCoverageFrom,
    '!src/index.ts',
  ],
};
