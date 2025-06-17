import { PubSub } from '@google-cloud/pubsub';

import { ExecutionLogger } from '../../definitions';
import { changeTimestampsToDateISOString, wait } from '../../utils';
import { DEFAULT_CONFIG, LOGS } from './pub-subs.service.constants';
import { PubSubServiceAccount } from './pub-subs.service.interfaces';

export class PubSubsService {
  private static instance: PubSubsService;

  public static getInstance(): PubSubsService {
    if (!PubSubsService.instance) {
      PubSubsService.instance = new PubSubsService();
    }
    return PubSubsService.instance;
  }
  private pubsub: PubSub;

  constructor(serviceAccount?: PubSubServiceAccount) {
    if (serviceAccount) {
      this.pubsub = new PubSub({
        projectId: serviceAccount.projectId,
        credentials: {
          client_email: serviceAccount.clientEmail,
          private_key: serviceAccount.privateKey,
        }
      });
    } else {
      this.pubsub = new PubSub();
    }
  }


  public async publishToTopic(topicName: string, logger: ExecutionLogger, data: any, customAttributes: Record<string, string> = {}, config?: {
    retries?: {
      maxAttempts: number;
      waitTime?: number;
    };
  }): Promise<void> {
    const { maxAttempts, waitTime } = { ...DEFAULT_CONFIG.retries, ...config?.retries };
    let error: any, parsedData: any = null, timesTried = 0;
    while (timesTried < maxAttempts) {
      if (timesTried > 0) {
        await wait(waitTime);
      }
      timesTried++;
      try {
        parsedData = changeTimestampsToDateISOString(data);
        await this.pubsub.topic(topicName).publishMessage({
          data: Buffer.from(JSON.stringify(parsedData)),
          attributes: customAttributes,
        });
        logger.info({ logId: LOGS.PUBLISH_TO_TOPIC_SUCCESS.logId, topic: topicName, data: parsedData, customAttributes }, LOGS.PUBLISH_TO_TOPIC_SUCCESS.logMessage);
        return;
      } catch (err) {
        logger.warn({ logId: LOGS.PUBLISH_TO_TOPIC_TRY_FAILED.logId, topic: topicName, error: err }, LOGS.PUBLISH_TO_TOPIC_TRY_FAILED.logMessage);
        error = err;
      }
    }
    logger.error({ logId: LOGS.PUBLISH_TO_TOPIC_FAILED.logId, topic: topicName, data: parsedData, customAttributes }, LOGS.PUBLISH_TO_TOPIC_FAILED.logMessage(topicName, error));
    throw error;
  }
}