import { STATUS_CODES } from '@repo/fastify';
import { SubscriptionsService } from '@repo/shared/services';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../../subscriptions.endpoints.constants';
import { STEPS } from '../subscriptions.delete.handler.constants';
import { deleteSubscriptionHandler } from '../subscriptions.delete.handler';

jest.mock('@repo/shared/services');
jest.mock('@repo/shared/utils', () => ({
  ...jest.requireActual('@repo/shared/utils'),
  DomainModelServiceError: jest.fn(),
  DomainModelServiceErrorCode: jest.fn(),
}));

describe(deleteSubscriptionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockService: Partial<SubscriptionsService>;
  let mockLogger: Partial<FastifyBaseLogger>;

  const mockParams = { id: 'test-id' };
  const logGroup = deleteSubscriptionHandler.name;
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
      deleteResource: jest.fn(),
    };

    (SubscriptionsService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully delete a subscription', async () => {
    jest.spyOn(mockService, 'deleteResource').mockResolvedValue();

    await deleteSubscriptionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_SUBSCRIPTION.id, logGroup);
    expect(mockService.deleteResource).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.DELETE_SUBSCRIPTION.id,
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle non-existent subscription', async () => {
    jest.spyOn(mockService, 'deleteResource').mockRejectedValue(
      new DomainModelServiceError({
        code: DomainModelServiceErrorCode.RESOURCE_NOT_FOUND,
        message: 'Subscription not found',
      }),
    );

    await deleteSubscriptionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_SUBSCRIPTION.id, logGroup);
    expect(mockService.deleteResource).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.DELETE_SUBSCRIPTION.id,
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith(
      ERROR_RESPONSES.SUBSCRIPTION_NOT_FOUND,
    );
  });

  it('should throw unexpected errors', async () => {
    const error = new Error('Unexpected error');
    jest.spyOn(mockService, 'deleteResource').mockRejectedValue(error);

    await expect(
      deleteSubscriptionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_SUBSCRIPTION.id, logGroup);
    expect(mockService.deleteResource).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.DELETE_SUBSCRIPTION.id,
    );
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
}); 