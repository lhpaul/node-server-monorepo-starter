import { onSchedule, ScheduleOptions, ScheduleFunction } from 'firebase-functions/v2/scheduler';

import { FunctionLogger } from '../logging/function-logger.class';
import { LOGS, SCHEDULE_DEFAULT_OPTIONS, STEPS } from './schedulers.utils.constants';
import { SchedulerHandlerFunction } from './schedulers.utils.interfaces';

/**
 * Wrapper for the onSchedule function to add a logger to the handler
 * @param schedule - The schedule to run the handler on
 * @param handler - The handler to run
 * @returns The wrapped handler
 */
export function onScheduleWrapper(handlerName: string, schedule: string, handler: SchedulerHandlerFunction, options?: ScheduleOptions): ScheduleFunction {
  const logger = new FunctionLogger();
  logger.info({
    logId: LOGS.SCHEDULER_STARTED.logId,
    schedule,
    handler: handlerName,
  }, LOGS.SCHEDULER_STARTED.logMessage);
  logger.startStep(STEPS.SCHEDULER_STARTED.label);
  return onSchedule({
    ...SCHEDULE_DEFAULT_OPTIONS,
    ...options,
    schedule,
  }, (event) => {
    logger.startStep(STEPS.SCHEDULER_STARTED.label);
    return handler(logger, event)
      .finally(() => logger.endStep(STEPS.SCHEDULER_STARTED.label));
  });
}