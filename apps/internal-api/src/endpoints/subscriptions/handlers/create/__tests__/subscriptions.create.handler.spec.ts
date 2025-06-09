import { STATUS_CODES } from '@repo/fastify';
import { SubscriptionsRepository } from '@repo/shared/repositories';
import { RepositoryError, RepositoryErrorCode } from '@repo/shared/utils';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../../subscriptions.endpoints.constants';
import { STEPS } from '../subscriptions.create.handler.constants';
import { createSubscriptionHandler } from '../subscriptions.create.handler';

jest.mock('@repo/shared/repositories');

describe(createSubscriptionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockRepository: Partial<SubscriptionsRepository>;

  const mockBody = {
    companyId: '123',
    startsAt: '2024-01-01T00:00:00.000Z',
    endsAt: '2024-12-31T23:59:59.999Z',
  };

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger as FastifyBaseLogger,
      body: mockBody,
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockRepository = {
      createDocument: jest.fn(),
    };

    (SubscriptionsRepository.getInstance as jest.Mock).mockReturnValue(
      mockRepository,
    );
  });

  it('should successfully create a subscription', async () => {
    const mockId = 'new-subscription-id';
    jest.spyOn(mockRepository, 'createDocument').mockResolvedValue(mockId);

    await createSubscriptionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CREATE_SUBSCRIPTION.id);
    expect(mockRepository.createDocument).toHaveBeenCalledWith(
      {
        ...mockBody,
        startsAt: new Date(mockBody.startsAt),
        endsAt: new Date(mockBody.endsAt),
      },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.CREATE_SUBSCRIPTION.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.CREATED);
    expect(mockReply.send).toHaveBeenCalledWith({ id: mockId });
  });

  it('should handle company not found error', async () => {
    const error = new RepositoryError({
      code: RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND,
      message: 'Company not found',
      data: {
        companyId: mockBody.companyId,
      },
    });
    jest.spyOn(mockRepository, 'createDocument').mockRejectedValue(error);

    await createSubscriptionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CREATE_SUBSCRIPTION.id);
    expect(mockRepository.createDocument).toHaveBeenCalledWith(
      {
        ...mockBody,
        startsAt: new Date(mockBody.startsAt),
        endsAt: new Date(mockBody.endsAt),
      },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.CREATE_SUBSCRIPTION.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.BAD_REQUEST);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: ERROR_RESPONSES.COMPANY_NOT_FOUND.code,
      message: ERROR_RESPONSES.COMPANY_NOT_FOUND.message(mockBody.companyId),
    });
  });

  it('should handle other repository errors', async () => {
    const error = new Error('Repository error');
    jest.spyOn(mockRepository, 'createDocument').mockRejectedValue(error);

    await expect(
      createSubscriptionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CREATE_SUBSCRIPTION.id);
    expect(mockRepository.createDocument).toHaveBeenCalledWith(
      {
        ...mockBody,
        startsAt: new Date(mockBody.startsAt),
        endsAt: new Date(mockBody.endsAt),
      },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.CREATE_SUBSCRIPTION.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
}); 