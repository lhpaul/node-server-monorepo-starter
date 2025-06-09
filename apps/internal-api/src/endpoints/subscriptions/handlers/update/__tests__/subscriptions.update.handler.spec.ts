import { STATUS_CODES } from '@repo/fastify';
import { SubscriptionsRepository } from '@repo/shared/repositories';
import { RepositoryError, RepositoryErrorCode } from '@repo/shared/utils';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../../subscriptions.endpoints.constants';
import { STEPS } from '../subscriptions.update.handler.constants';
import { updateSubscriptionHandler } from '../subscriptions.update.handler';

jest.mock('@repo/shared/repositories');
jest.mock('@repo/shared/utils', () => ({
  ...jest.requireActual('@repo/shared/utils'),
  RepositoryError: jest.fn(),
  RepositoryErrorCode: jest.fn(),
}));

describe(updateSubscriptionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockRepository: Partial<SubscriptionsRepository>;
  let mockLogger: Partial<FastifyBaseLogger>;
  const mockParams = { id: '123' };
  const mockBody = {
    startsAt: '2024-03-20',
    endsAt: '2024-04-20',
  };

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

    mockRepository = {
      updateDocument: jest.fn(),
    };

    (SubscriptionsRepository.getInstance as jest.Mock).mockReturnValue(
      mockRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully update a subscription', async () => {
    await updateSubscriptionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_SUBSCRIPTION.id);
    expect(mockRepository.updateDocument).toHaveBeenCalledWith(
      mockParams.id,
      {
        ...mockBody,
        startsAt: new Date(mockBody.startsAt),
        endsAt: new Date(mockBody.endsAt),
      },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.UPDATE_SUBSCRIPTION.id,
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle subscription not found error', async () => {
    jest.spyOn(mockRepository, 'updateDocument').mockRejectedValue(
      new RepositoryError({
        code: RepositoryErrorCode.DOCUMENT_NOT_FOUND,
        message: 'Subscription not found',
      }),
    );

    await updateSubscriptionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_SUBSCRIPTION.id);
    expect(mockRepository.updateDocument).toHaveBeenCalledWith(
      mockParams.id,
      {
        ...mockBody,
        startsAt: new Date(mockBody.startsAt),
        endsAt: new Date(mockBody.endsAt),
      },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.UPDATE_SUBSCRIPTION.id,
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith(
      ERROR_RESPONSES.SUBSCRIPTION_NOT_FOUND,
    );
  });

  it('should throw unexpected errors', async () => {
    const unexpectedError = new Error('Unexpected error');
    jest.spyOn(mockRepository, 'updateDocument').mockRejectedValue(unexpectedError);

    await expect(
      updateSubscriptionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(unexpectedError);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_SUBSCRIPTION.id);
    expect(mockRepository.updateDocument).toHaveBeenCalledWith(
      mockParams.id,
      {
        ...mockBody,
        startsAt: new Date(mockBody.startsAt),
        endsAt: new Date(mockBody.endsAt),
      },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.UPDATE_SUBSCRIPTION.id,
    );
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
}); 