import { SubscriptionsService, SyncCompanyTransactionsMessage } from '@repo/shared/domain';
import { publishMessage } from '@repo/shared/utils';
import moment from 'moment';

import { FunctionLogger } from '../../../../utils/logging/function-logger.class';
import { syncCompaniesTransactionsHandler } from '../sync-companies-transactions.function.handler';
import { STEPS } from '../sync-companies-transactions.function.constants';
import { SYNC_COMPANY_TRANSACTIONS_TOPIC } from '../../../pub-subs/sync-company-transactions/sync-company-transactions.function.constants';

// Mock dependencies
jest.mock('@repo/shared/domain');
jest.mock('@repo/shared/utils');
jest.mock('moment');

describe(syncCompaniesTransactionsHandler.name, () => {
  let mockLogger: jest.Mocked<FunctionLogger>;
  let mockSubscriptionsService: jest.Mocked<SubscriptionsService>;
  let mockMoment: jest.Mocked<any>;
  const logGroup = syncCompaniesTransactionsHandler.name;

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
      getActiveSubscriptions: jest.fn(),
    } as unknown as jest.Mocked<SubscriptionsService>;

    // Setup singleton instance
    (SubscriptionsService.getInstance as jest.Mock).mockReturnValue(mockSubscriptionsService);

    // Setup moment mock
    const mockNow = {
      subtract: jest.fn().mockReturnThis(),
      format: jest.fn().mockReturnValue('2024-01-15'),
    };
    mockMoment = jest.mocked(moment);
    mockMoment.mockReturnValue(mockNow as any);
  });

  it('should process active subscriptions and publish sync messages', async () => {
    // Mock subscription data
    const mockSubscriptions = [
      { 
        id: 'sub1', 
        companyId: 'company1',
        createdAt: new Date(),
        updatedAt: new Date(),
        startsAt: new Date(),
        endsAt: new Date()
      },
      { 
        id: 'sub2', 
        companyId: 'company2',
        createdAt: new Date(),
        updatedAt: new Date(),
        startsAt: new Date(),
        endsAt: new Date()
      },
    ];

    mockSubscriptionsService.getActiveSubscriptions.mockResolvedValue(mockSubscriptions);
    (publishMessage as jest.Mock).mockResolvedValue(undefined);

    // Execute handler
    await syncCompaniesTransactionsHandler(mockLogger);

    // Verify service call
    expect(mockSubscriptionsService.getActiveSubscriptions).toHaveBeenCalledWith(mockLogger);

    // Verify logger calls for getting active subscriptions
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_ACTIVE_SUBSCRIPTIONS, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_ACTIVE_SUBSCRIPTIONS);

    // Verify logger calls for publishing messages
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.PUBLISH_SYNC_COMPANIES_TRANSACTIONS_MESSAGES, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.PUBLISH_SYNC_COMPANIES_TRANSACTIONS_MESSAGES);

    // Verify individual subscription processing
    expect(mockLogger.startStep).toHaveBeenCalledWith(`${STEPS.PUBLISH_SYNC_COMPANIES_TRANSACTIONS_MESSAGES}-sub1`, logGroup);
    expect(mockLogger.startStep).toHaveBeenCalledWith(`${STEPS.PUBLISH_SYNC_COMPANIES_TRANSACTIONS_MESSAGES}-sub2`, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(`${STEPS.PUBLISH_SYNC_COMPANIES_TRANSACTIONS_MESSAGES}-sub1`);
    expect(mockLogger.endStep).toHaveBeenCalledWith(`${STEPS.PUBLISH_SYNC_COMPANIES_TRANSACTIONS_MESSAGES}-sub2`);

    // Verify moment usage
    expect(mockMoment).toHaveBeenCalled();
    const mockNow = mockMoment();
    expect(mockNow.subtract).toHaveBeenCalledWith(1, 'week');
    expect(mockNow.format).toHaveBeenCalledWith('YYYY-MM-DD');

    // Verify message publishing for each subscription
    expect(publishMessage).toHaveBeenCalledTimes(2);
    expect(publishMessage).toHaveBeenNthCalledWith(
      1,
      SyncCompanyTransactionsMessage,
      SYNC_COMPANY_TRANSACTIONS_TOPIC,
      {
        companyId: 'company1',
        fromDate: '2024-01-15',
        toDate: '2024-01-15',
      },
      mockLogger
    );
    expect(publishMessage).toHaveBeenNthCalledWith(
      2,
      SyncCompanyTransactionsMessage,
      SYNC_COMPANY_TRANSACTIONS_TOPIC,
      {
        companyId: 'company2',
        fromDate: '2024-01-15',
        toDate: '2024-01-15',
      },
      mockLogger
    );
  });

  it('should handle empty subscription list', async () => {
    // Mock empty subscription list
    mockSubscriptionsService.getActiveSubscriptions.mockResolvedValue([]);

    // Execute handler
    await syncCompaniesTransactionsHandler(mockLogger);

    // Verify service call
    expect(mockSubscriptionsService.getActiveSubscriptions).toHaveBeenCalledWith(mockLogger);

    // Verify logger calls
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_ACTIVE_SUBSCRIPTIONS, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_ACTIVE_SUBSCRIPTIONS);
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.PUBLISH_SYNC_COMPANIES_TRANSACTIONS_MESSAGES, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.PUBLISH_SYNC_COMPANIES_TRANSACTIONS_MESSAGES);

    // Verify no messages were published
    expect(publishMessage).not.toHaveBeenCalled();

    // Verify moment was still called
    expect(mockMoment).toHaveBeenCalled();
  });

  it('should handle service errors gracefully', async () => {
    // Mock service error
    const error = new Error('Service error');
    mockSubscriptionsService.getActiveSubscriptions.mockRejectedValue(error);

    // Execute handler and expect it to throw
    await expect(syncCompaniesTransactionsHandler(mockLogger)).rejects.toThrow(error);

    // Verify logger was still called
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_ACTIVE_SUBSCRIPTIONS, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_ACTIVE_SUBSCRIPTIONS);

    // Verify no messages were published
    expect(publishMessage).not.toHaveBeenCalled();
  });

  it('should handle publish message errors gracefully', async () => {
    // Mock subscription data
    const mockSubscriptions = [
      { 
        id: 'sub1', 
        companyId: 'company1',
        createdAt: new Date(),
        updatedAt: new Date(),
        startsAt: new Date(),
        endsAt: new Date()
      },
    ];

    mockSubscriptionsService.getActiveSubscriptions.mockResolvedValue(mockSubscriptions);
    
    // Mock publish message error
    const publishError = new Error('Publish error');
    (publishMessage as jest.Mock).mockRejectedValue(publishError);

    // Execute handler and expect it to throw
    await expect(syncCompaniesTransactionsHandler(mockLogger)).rejects.toThrow(publishError);

    // Verify service call
    expect(mockSubscriptionsService.getActiveSubscriptions).toHaveBeenCalledWith(mockLogger);

    // Verify logger calls
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_ACTIVE_SUBSCRIPTIONS, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_ACTIVE_SUBSCRIPTIONS);
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.PUBLISH_SYNC_COMPANIES_TRANSACTIONS_MESSAGES, logGroup);
    expect(mockLogger.startStep).toHaveBeenCalledWith(`${STEPS.PUBLISH_SYNC_COMPANIES_TRANSACTIONS_MESSAGES}-sub1`, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(`${STEPS.PUBLISH_SYNC_COMPANIES_TRANSACTIONS_MESSAGES}-sub1`);

    // Verify publish message was called
    expect(publishMessage).toHaveBeenCalledWith(
      SyncCompanyTransactionsMessage,
      SYNC_COMPANY_TRANSACTIONS_TOPIC,
      {
        companyId: 'company1',
        fromDate: '2024-01-15',
        toDate: '2024-01-15',
      },
      mockLogger
    );
  });

  it('should use correct date range for sync', async () => {
    // Mock subscription data
    const mockSubscriptions = [
      { 
        id: 'sub1', 
        companyId: 'company1',
        createdAt: new Date(),
        updatedAt: new Date(),
        startsAt: new Date(),
        endsAt: new Date()
      },
    ];

    // Setup moment mock with specific return values
    const mockNow = {
      subtract: jest.fn().mockReturnThis(),
      format: jest.fn()
        .mockReturnValueOnce('2024-01-08') // fromDate (1 week ago)
        .mockReturnValueOnce('2024-01-15'), // toDate (now)
    };
    (mockMoment as jest.Mock).mockReturnValue(mockNow as any);

    mockSubscriptionsService.getActiveSubscriptions.mockResolvedValue(mockSubscriptions);
    (publishMessage as jest.Mock).mockResolvedValue(undefined);

    // Execute handler
    await syncCompaniesTransactionsHandler(mockLogger);

    // Verify moment usage
    expect(mockMoment).toHaveBeenCalled();
    expect(mockNow.subtract).toHaveBeenCalledWith(1, 'week');
    expect(mockNow.format).toHaveBeenCalledWith('YYYY-MM-DD');

    // Verify correct date range in message
    expect(publishMessage).toHaveBeenCalledWith(
      SyncCompanyTransactionsMessage,
      SYNC_COMPANY_TRANSACTIONS_TOPIC,
      {
        companyId: 'company1',
        fromDate: '2024-01-08',
        toDate: '2024-01-15',
      },
      mockLogger
    );
  });
});
