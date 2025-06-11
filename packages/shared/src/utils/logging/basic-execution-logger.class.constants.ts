export const LOGS = {
  STEP_START: {
    logId: 'step-start',
    logMessage: (step: string) => `step ${step} started`,
  },
  STEP_END: {
    logId: 'step-end',
    logMessage: (step: string) => `step ${step} ended`,
  },
};
