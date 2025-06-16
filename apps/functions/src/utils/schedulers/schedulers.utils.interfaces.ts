import { ScheduledEvent } from 'firebase-functions/scheduler';
import { FunctionLogger } from '../logging/function-logger.class';

export interface SchedulerHandlerFunction {
  (logger: FunctionLogger, event: ScheduledEvent): Promise<void>;
}