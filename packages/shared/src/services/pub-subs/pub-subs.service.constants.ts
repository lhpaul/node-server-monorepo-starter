import { printError } from "../../utils";

export const DEFAULT_CONFIG = {
  retries: {
    maxAttempts: 5,
    waitTime: 1000,
  },
};

export const LOGS = {
  PUBLISH_TO_TOPIC_SUCCESS: {
    logId: 'publish-to-topic-success',
    logMessage: 'Publishing to topic success',
  },
  PUBLISH_TO_TOPIC_TRY_FAILED: {
    logId: 'publish-to-topic-try-failed',
    logMessage: 'Publishing to topic try failed'
  },
  PUBLISH_TO_TOPIC_FAILED: {
    logId: 'publish-to-topic-failed',
    logMessage: (topic: string, error: any) => `Publishing to topic ${topic} failed, error ${printError(error)}`,
  },
};