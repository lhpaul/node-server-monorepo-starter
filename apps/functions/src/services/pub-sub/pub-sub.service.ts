import { PubSub } from '@google-cloud/pubsub';
import { ExecutionLogger } from '@repo/shared/definitions';
import { changeTimestampsToDateISOString, wait } from '@repo/shared/utils';

import { DEFAULT_CONFIG, LOGS } from './pub-sub.service.constants';
import { PubSubServiceAccount } from './pub-sub.service.interfaces';

export class PubSubService {
  private static instance: PubSubService;

  public static getInstance(): PubSubService {
    if (!PubSubService.instance) {
      PubSubService.instance = new PubSubService();
    }
    return PubSubService.instance;
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


  public async publishToTopic(topicName: string, logger: ExecutionLogger, data = {}, customAttributes = {}, config?: {
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