import { validate } from 'class-validator';

import { PubSubsService } from '../../services';
import { ExecutionLogger } from '../../definitions';
import { printError } from '../errors/errors.utils';
import { LOGS, STEPS } from './pub-subs.utils.constants';

/**
 * Publish a message to a Pub/Sub topic.
 * @param classType - The class type to validate the message against.
 * @param topic - The Pub/Sub topic to publish the message to.
 * @param message - The message to publish.
 * @param logger - The logger to use.
 * @param customAttributes - Custom attributes to add to the message.
 */
export async function publishMessage<T>(classType: new (value: any) => T, topic: string, message: T, logger: ExecutionLogger, customAttributes?: Record<string, string>): Promise<void> {
  try {
    const parsedMessage = new classType(message);
    logger.startStep(STEPS.VALIDATE_MESSAGE.label);
    const errors = await validate(parsedMessage as object)
      .finally(() => logger.endStep(STEPS.VALIDATE_MESSAGE.label));
    if (errors.length > 0) {
      logger.warn({
        logId: LOGS.INVALID_MESSAGE_FORMAT.logId,
        errors: printError(errors),
      }, LOGS.INVALID_MESSAGE_FORMAT.logMessage);
      return;
    }
    await PubSubsService.getInstance().publishToTopic(topic, logger, parsedMessage as object, customAttributes);
  } catch (error) {
    logger.error({
      logId: LOGS.UNKNOWN_ERROR.logId,
      error: printError(error),
    }, LOGS.UNKNOWN_ERROR.logMessage);
    throw error;
  }
}