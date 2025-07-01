import { STATUS_CODES } from '@repo/fastify';
import { SubscriptionsService } from '@repo/shared/services';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../../subscriptions.endpoints.constants';
import { STEPS } from '../subscriptions.get.handler.constants';
import { getSubscriptionHandler } from '../subscriptions.get.handler';

jest.mock('@repo/shared/services');

describe(getSubscriptionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockService: Partial<SubscriptionsService>;

  const mockParams = { id: '123' };
  const logGroup = getSubscriptionHandler.name;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger as FastifyBaseLogger,
      params: mockParams,
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      getResource: jest.fn(),
    };

    (SubscriptionsService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );
  });

  it('should successfully retrieve a subscription', async () => {
    const mockSubscription = {
      id: mockParams.id,
      companyId: 'company-123',
      startsAt: new Date(),
      endsAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(mockService, 'getResource').mockResolvedValue(mockSubscription);

    await getSubscriptionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTION.id, logGroup);
    expect(mockService.getResource).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTION.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockSubscription);
  });

  it('should handle subscription not found', async () => {
    jest.spyOn(mockService, 'getResource').mockResolvedValue(null);

    await getSubscriptionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTION.id, logGroup);
    expect(mockService.getResource).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTION.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith(
      ERROR_RESPONSES.SUBSCRIPTION_NOT_FOUND,
    );
  });

  it('should handle service errors', async () => {
    const error = new Error('Service error');
    jest.spyOn(mockService, 'getResource').mockRejectedValue(error);

    await expect(
      getSubscriptionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTION.id, logGroup);
    expect(mockService.getResource).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTION.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
}); 