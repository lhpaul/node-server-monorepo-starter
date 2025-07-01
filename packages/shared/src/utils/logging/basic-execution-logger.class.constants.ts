export const LOGS = {
  STEP_START: {
    logId: 'step-start',
    logMessage: (step: string, group: string) =>
      `[${group}] step ${step} started`,
  },
  STEP_END: {
    logId: 'step-end',
    logMessage: (step: string, elapsedTime: number, group: string) =>
      `[${group}] step ${step} ended. It took ${elapsedTime}ms`,
  },
};
