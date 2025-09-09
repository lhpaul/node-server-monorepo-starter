import { CloudEvent } from 'firebase-functions/core';
import { MessagePublishedData, PubSubOptions as FirebasePubSubOptions } from 'firebase-functions/v2/pubsub';

import { FunctionLogger } from '../logging/function-logger.class';

export interface HandlerFunction<T extends object> {
  (message: T, logger: FunctionLogger, event: CloudEvent<MessagePublishedData<T>>): any | Promise<any>;
}

export interface PubSubOptions extends FirebasePubSubOptions {
  maskMessageFields?: string[];
}
