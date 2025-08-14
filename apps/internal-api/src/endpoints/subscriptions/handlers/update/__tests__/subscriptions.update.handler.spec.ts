import { STATUS_CODES } from '@repo/fastify';
import { SubscriptionsService } from '@repo/shared/domain';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../../subscriptions.endpoints.constants';
import { STEPS } from '../subscriptions.update.handler.constants';
import { updateSubscriptionHandler } from '../subscriptions.update.handler';

jest.mock('@repo/shared/domain');

describe(updateSubscriptionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockService: Partial<SubscriptionsService>;
  let mockLogger: Partial<FastifyBaseLogger>;
  const mockParams = { id: '123' };
  const mockBody = {
    startsAt: '2024-03-20',
    endsAt: '2024-04-20',
  };
  const logGroup = updateSubscriptionHandler.name;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger as FastifyBaseLogger,
      params: mockParams,
      body: mockBody,
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      updateResource: jest.fn(),
    };

    (SubscriptionsService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully update a subscription', async () => {
    jest.spyOn(mockService, 'updateResource').mockResolvedValueOnce(undefined);
    await updateSubscriptionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_SUBSCRIPTION, logGroup);
    expect(mockService.updateResource).toHaveBeenCalledWith(
      mockParams.id,
      {
        ...mockBody,
        startsAt: new Date(mockBody.startsAt),
        endsAt: new Date(mockBody.endsAt),
      },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.UPDATE_SUBSCRIPTION,
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle subscription not found error', async () => {
    jest.spyOn(mockService, 'updateResource').mockRejectedValueOnce(
      new DomainModelServiceError({
        code: DomainModelServiceErrorCode.RESOURCE_NOT_FOUND,
        message: 'Subscription not found',
      }),
    );

    await updateSubscriptionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_SUBSCRIPTION, logGroup);
    expect(mockService.updateResource).toHaveBeenCalledWith(
      mockParams.id,
      {
        ...mockBody,
        startsAt: new Date(mockBody.startsAt),
        endsAt: new Date(mockBody.endsAt),
      },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.UPDATE_SUBSCRIPTION,
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith(
      ERROR_RESPONSES.SUBSCRIPTION_NOT_FOUND,
    );
  });

  it('should handle invalid input error', async () => {
    const errorMessage = 'Invalid input';
    const errorData = {
      startsAt: {
        code: 'INVALID_DATE_FORMAT',
        message: 'Invalid date format',
      },
    };
    const error = new DomainModelServiceError({ code: DomainModelServiceErrorCode.INVALID_INPUT, message: errorMessage, data: errorData });
    jest.spyOn(mockService, 'updateResource').mockRejectedValue(error);

    await updateSubscriptionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_SUBSCRIPTION, logGroup);
    expect(mockService.updateResource).toHaveBeenCalledWith(
      mockParams.id,
      {
        ...mockBody,
        startsAt: new Date(mockBody.startsAt),
        endsAt: new Date(mockBody.endsAt),
      },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_SUBSCRIPTION);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.BAD_REQUEST);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: DomainModelServiceErrorCode.INVALID_INPUT,
      message: errorMessage,
      data: errorData,
    });
  });

  it('should throw unexpected errors', async () => {
    const unexpectedError = new Error('Unexpected error');
    jest.spyOn(mockService, 'updateResource').mockRejectedValue(unexpectedError);

    await expect(
      updateSubscriptionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(unexpectedError);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_SUBSCRIPTION, logGroup);
    expect(mockService.updateResource).toHaveBeenCalledWith(
      mockParams.id,
      {
        ...mockBody,
        startsAt: new Date(mockBody.startsAt),
        endsAt: new Date(mockBody.endsAt),
      },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.UPDATE_SUBSCRIPTION,
    );
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
}); 