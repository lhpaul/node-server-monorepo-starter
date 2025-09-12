import { maskFields, printError } from '@repo/shared/utils';
import { validate } from 'class-validator';
import { CloudEvent, CloudFunction } from 'firebase-functions/core';
import { MessagePublishedData, onMessagePublished } from 'firebase-functions/v2/pubsub';

import { FunctionLogger } from '../logging/function-logger.class';
import { HandlerFunction, PubSubOptions } from './pub-subs.utils.interfaces';
import { LOG_GROUP, LOGS, STEPS } from './pub-subs.utils.constants';

/**
 * Handle a message being published to a Pub/Sub topic.
 * @param topic - The Pub/Sub topic to watch for message events.
 * @param handler - runs every time a Cloud Pub/Sub message is published
 * @param options - options for the Pub/Sub handler
 * @typeParam T - Type representing `Message.data`'s JSON format
 */
export function onMessagePublishedWrapper<T extends object>(classType: new (value: any) => T, handler: HandlerFunction<T>, options: PubSubOptions): CloudFunction<CloudEvent<MessagePublishedData<T>>> {
  const logGroup = `${LOG_GROUP}.${onMessagePublishedWrapper.name}`;
  return onMessagePublished(
    options,
    async (event) => {
      const logger = new FunctionLogger();
      try {
        const message = new classType(event.data.message.json);
        logger.info({
          logId: LOGS.MESSAGE_RECEIVED.logId,
          message: options?.maskMessageFields ? maskFields(message, options.maskMessageFields) : message,
        }, LOGS.MESSAGE_RECEIVED.logMessage);
        logger.startStep(STEPS.VALIDATE_MESSAGE.label, logGroup);
        const errors = await validate(message as object)
          .finally(() => logger.endStep(STEPS.VALIDATE_MESSAGE.label));
        if (errors.length > 0) {
          logger.warn({
            logId: LOGS.INVALID_MESSAGE_FORMAT.logId,
            errors: printError(errors),
          }, LOGS.INVALID_MESSAGE_FORMAT.logMessage);
          return;
        }
        await handler(message, logger, event);
      } catch (error) {
        logger.error({
          logId: LOGS.UNKNOWN_ERROR.logId,
          error: printError(error),
        }, LOGS.UNKNOWN_ERROR.logMessage);
        throw error;
      }
    },
  );
}
