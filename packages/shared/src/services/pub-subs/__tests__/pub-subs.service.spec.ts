import { ExecutionLogger } from '../../../definitions';
import { changeTimestampsToDateISOString, wait } from '../../../utils';

import { PubSubsService } from '../pub-subs.service';
import { DEFAULT_CONFIG, LOGS } from '../pub-subs.service.constants';
import { PubSubServiceAccount } from '../pub-subs.service.interfaces';

jest.mock('@google-cloud/pubsub', () => {
  return {
    PubSub: jest.fn().mockImplementation(() => ({
      topic: jest.fn().mockReturnValue({
        publishMessage: jest.fn(),
      }),
    })),
  };
});

jest.mock('../../../utils', () => ({
  changeTimestampsToDateISOString: jest.fn((data) => data),
  wait: jest.fn(() => Promise.resolve()),
  printError: jest.fn().mockReturnValue('error'),
}));

const mockLogger: jest.Mocked<ExecutionLogger> = {
  lastStep: { id: '' },
  stepsCounter: 0,
  initTime: 0,
  startStep: jest.fn(),
  endStep: jest.fn(),
  getStepElapsedTime: jest.fn(),
  getTotalElapsedTime: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
};

describe(PubSubsService.name, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should implement singleton pattern', () => {
    const instance1 = PubSubsService.getInstance();
    const instance2 = PubSubsService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should initialize pubsub with service account if provided', () => {
    const { PubSub } = require('@google-cloud/pubsub');
    const serviceAccount: PubSubServiceAccount = {
      projectId: 'pid',
      clientEmail: 'email',
      privateKey: 'key',
    };
    new PubSubsService(serviceAccount);
    expect(PubSub).toHaveBeenCalledWith({
      projectId: serviceAccount.projectId,
      credentials: {
        client_email: serviceAccount.clientEmail,
        private_key: serviceAccount.privateKey,
      },
    });
  });

  it('should initialize pubsub without service account if not provided', () => {
    const { PubSub } = require('@google-cloud/pubsub');
    new PubSubsService();
    expect(PubSub).toHaveBeenCalledWith();
  });

  describe(PubSubsService.prototype.publishToTopic.name, () => {
    const topicName = 'test-topic';
    const data = { foo: 'bar' };
    const customAttributes = { attr: 'val' };
    let service: PubSubsService;
    let pubsubMock: any;
    let publishMessageMock: jest.Mock;

    beforeEach(() => {
      service = new PubSubsService();
      pubsubMock = (service as any).pubsub;
      publishMessageMock = jest.fn();
      pubsubMock.topic = jest.fn().mockReturnValue({ publishMessage: publishMessageMock });
    });

    it('should publish message and log success', async () => {
      publishMessageMock.mockResolvedValueOnce(undefined);
      await service.publishToTopic(topicName, mockLogger, data, customAttributes);
      expect(publishMessageMock).toHaveBeenCalledWith({
        data: Buffer.from(JSON.stringify(data)),
        attributes: customAttributes,
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({ logId: LOGS.PUBLISH_TO_TOPIC_SUCCESS.logId, topic: topicName }),
        LOGS.PUBLISH_TO_TOPIC_SUCCESS.logMessage
      );
    });

    it('should handle empty custom attributes', async () => {
      await service.publishToTopic(topicName, mockLogger, data);
      expect(changeTimestampsToDateISOString).toHaveBeenCalledWith(data);
      expect(publishMessageMock).toHaveBeenCalledWith({
        data: Buffer.from(JSON.stringify(data)),
        attributes: {},
      });
    });

    it('should retry on failure and eventually succeed', async () => {
      publishMessageMock
        .mockRejectedValueOnce(new Error('fail1'))
        .mockResolvedValueOnce(undefined);
      await service.publishToTopic(topicName, mockLogger, data, customAttributes, { retries: { maxAttempts: 2, waitTime: 1 } });
      expect(publishMessageMock).toHaveBeenCalledTimes(2);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({ logId: LOGS.PUBLISH_TO_TOPIC_TRY_FAILED.logId, topic: topicName }),
        LOGS.PUBLISH_TO_TOPIC_TRY_FAILED.logMessage
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({ logId: LOGS.PUBLISH_TO_TOPIC_SUCCESS.logId, topic: topicName }),
        LOGS.PUBLISH_TO_TOPIC_SUCCESS.logMessage
      );
    });

    it('should throw and log error after max retries', async () => {
      const error = new Error('fail');
      publishMessageMock.mockRejectedValue(error);
      try {
        await service.publishToTopic(topicName, mockLogger, data, customAttributes, { retries: { maxAttempts: 2, waitTime: 1 } });
      } catch (e) {
        expect(e).toBe(error);
        expect(mockLogger.warn).toHaveBeenCalledTimes(2);
        expect(mockLogger.error).toHaveBeenCalledWith(
          expect.objectContaining({ logId: LOGS.PUBLISH_TO_TOPIC_FAILED.logId, topic: topicName }),
          expect.stringContaining('Publishing to topic')
        );
      }
    });

    it('should use default config if no config is provided', async () => {
      const error = new Error('fail');
      publishMessageMock.mockRejectedValue(error);
      try {
        await service.publishToTopic(topicName, mockLogger, data, customAttributes);
      } catch (e) {
        expect(e).toBe(error);
      }
      expect(publishMessageMock).toHaveBeenCalledTimes(DEFAULT_CONFIG.retries.maxAttempts);
      expect(mockLogger.warn).toHaveBeenCalledTimes(DEFAULT_CONFIG.retries.maxAttempts);
      expect(wait).toHaveBeenCalledTimes(DEFAULT_CONFIG.retries.maxAttempts - 1);
    });
  });
}); 