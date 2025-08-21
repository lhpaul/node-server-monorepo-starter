import { SubscriptionsService } from '@repo/shared/domain';
import { publishMessage } from '@repo/shared/utils';

import { FunctionLogger } from '../../../../utils/logging/function-logger.class';
import { checkForAboutToExpireSubscriptionsHandler } from '../check-for-about-to-expire-subscriptions.function.handler';
import { DAYS_TO_EXPIRE_TO_NOTIFY, HANDLER_NAME, LOGS, STEPS } from '../check-for-about-to-expire-subscriptions.function.constants';
import { NOTIFY_SUBSCRIPTION_ABOUT_TO_EXPIRE_TOPIC } from '../../../pub-subs/notify-subscription-about-to-expire/notify-subscription-about-to-expire.function.constants';

// Mock dependencies
jest.mock('@repo/shared/domain');
jest.mock('@repo/shared/utils');

describe(checkForAboutToExpireSubscriptionsHandler.name, () => {
  let mockLogger: jest.Mocked<FunctionLogger>;
  let mockSubscriptionsService: jest.Mocked<SubscriptionsService>;
  const logGroup = checkForAboutToExpireSubscriptionsHandler.name;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock logger
    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
      info: jest.fn(),
    } as unknown as jest.Mocked<FunctionLogger>;

    // Setup mock subscriptions service
    mockSubscriptionsService = {
      getAboutToExpireSubscriptions: jest.fn(),
    } as unknown as jest.Mocked<SubscriptionsService>;

    // Setup singleton instance
    (SubscriptionsService.getInstance as jest.Mock).mockReturnValue(mockSubscriptionsService);
  });

  it('should process subscriptions for each notification interval', async () => {
    // Mock subscription data
    const mockSubscriptions = [
      { 
        id: 'sub1', 
        companyId: 'company1',
        createdAt: new Date(),
        updatedAt: new Date(),
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      { 
        id: 'sub2', 
        companyId: 'company2',
        createdAt: new Date(),
        updatedAt: new Date(),
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      },
    ];

    // Mock service responses for each interval
    mockSubscriptionsService.getAboutToExpireSubscriptions
      .mockResolvedValueOnce([mockSubscriptions[0]]) // 7 days
      .mockResolvedValueOnce([mockSubscriptions[1]]) // 14 days
      .mockResolvedValueOnce([]); // 28 days

    (publishMessage as jest.Mock).mockResolvedValue(undefined);

    // Execute handler
    await checkForAboutToExpireSubscriptionsHandler(mockLogger);
    // Verify service calls
    expect(mockSubscriptionsService.getAboutToExpireSubscriptions).toHaveBeenCalledTimes(3);
    DAYS_TO_EXPIRE_TO_NOTIFY.forEach((days, index) => {
      expect(mockSubscriptionsService.getAboutToExpireSubscriptions).toHaveBeenNthCalledWith(
        index + 1,
        days,
        mockLogger
      );
    });

    // Verify logger calls
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTIONS, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTIONS);

    // Verify info logging for each interval
    expect(mockLogger.info).toHaveBeenCalledTimes(3);
    expect(mockLogger.info).toHaveBeenNthCalledWith(
      1,
      {
        logId: LOGS.NOTIFY_SUBSCRIPTION.logId,
        daysToExpire: DAYS_TO_EXPIRE_TO_NOTIFY[0],
        aboutToExpireSubscriptionsCount: 1,
      },
      LOGS.NOTIFY_SUBSCRIPTION.logMessage(DAYS_TO_EXPIRE_TO_NOTIFY[0], 1)
    );

    // Verify message publishing
    expect(publishMessage).toHaveBeenCalledTimes(2);
    expect(publishMessage).toHaveBeenNthCalledWith(
      1,
      expect.any(Function),
      NOTIFY_SUBSCRIPTION_ABOUT_TO_EXPIRE_TOPIC,
      {
        companyId: 'company1',
        daysToExpire: DAYS_TO_EXPIRE_TO_NOTIFY[0],
      },
      mockLogger,
      {
        source: HANDLER_NAME,
      }
    );
  });

  it('should handle empty subscription lists', async () => {
    // Mock empty responses for all intervals
    mockSubscriptionsService.getAboutToExpireSubscriptions
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    // Execute handler
    await checkForAboutToExpireSubscriptionsHandler(mockLogger);

    // Verify service calls
    expect(mockSubscriptionsService.getAboutToExpireSubscriptions).toHaveBeenCalledTimes(3);
    
    // Verify no messages were published
    expect(publishMessage).not.toHaveBeenCalled();

    // Verify logging
    expect(mockLogger.info).toHaveBeenCalledTimes(3);
    DAYS_TO_EXPIRE_TO_NOTIFY.forEach((days, index) => {
      expect(mockLogger.info).toHaveBeenNthCalledWith(
        index + 1,
        {
          logId: LOGS.NOTIFY_SUBSCRIPTION.logId,
          daysToExpire: days,
          aboutToExpireSubscriptionsCount: 0,
        },
        LOGS.NOTIFY_SUBSCRIPTION.logMessage(days, 0)
      );
    });
  });

  it('should handle service errors gracefully', async () => {
    // Mock service error
    const error = new Error('Service error');
    mockSubscriptionsService.getAboutToExpireSubscriptions.mockRejectedValueOnce(error);

    // Execute handler and expect it to throw
    await expect(checkForAboutToExpireSubscriptionsHandler(mockLogger)).rejects.toThrow(error);

    // Verify logger was still called
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTIONS, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTIONS);
  });
}); 