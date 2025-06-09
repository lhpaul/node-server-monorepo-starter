import { FORBIDDEN_ERROR, RESOURCE_NOT_FOUND_ERROR, STATUS_CODES } from '@repo/fastify';
import { SubscriptionsRepository } from '@repo/shared/repositories';
import { UserPermissions } from '@repo/shared/services';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from '../subscriptions.get.handler.constants';
import { getSubscriptionHandler } from '../subscriptions.get.handler';
import { hasCompanySubscriptionsReadPermission } from '../../../../../../../utils/auth/auth.utils';

jest.mock('@repo/fastify', () => ({
  STATUS_CODES: {
    OK: 200,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
  },
  RESOURCE_NOT_FOUND_ERROR: {
    responseCode: 'not-found',
    responseMessage: 'The requested resource was not found',
  },
  FORBIDDEN_ERROR: {
    responseCode: 403,
    responseMessage: 'Forbidden'
  }
}));

jest.mock('@repo/shared/repositories', () => ({
  ...jest.requireActual('@repo/shared/repositories'),
  SubscriptionsRepository: {
    getInstance: jest.fn().mockImplementation(() => ({
      getDocument: jest.fn(),
    })),
  },
}));

jest.mock('../../../../../../../utils/auth/auth.utils', () => ({
  hasCompanySubscriptionsReadPermission: jest.fn(),
}));

describe(getSubscriptionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockRepository: Partial<SubscriptionsRepository>;

  const mockParams = { companyId: 'company123', id: 'subscription123' };
  const mockUser: UserPermissions = {
    companies: {
      'company123': ['subscription:read'],
    },
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
      user: mockUser,
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockRepository = {
      getDocument: jest.fn(),
    };

    (SubscriptionsRepository.getInstance as jest.Mock).mockReturnValue(
      mockRepository,
    );

    (hasCompanySubscriptionsReadPermission as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return forbidden when user lacks read permission', async () => {
    (hasCompanySubscriptionsReadPermission as jest.Mock).mockReturnValue(false);

    await getSubscriptionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.FORBIDDEN);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
    expect(mockRepository.getDocument).not.toHaveBeenCalled();
  });

  it('should successfully get a subscription', async () => {
    const mockSubscription = {
      id: mockParams.id,
      companyId: mockParams.companyId,
      startsAt: new Date(),
      endsAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(mockRepository, 'getDocument').mockResolvedValue(mockSubscription);

    await getSubscriptionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTION.id);
    expect(mockRepository.getDocument).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTION.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockSubscription);
  });

  it('should handle subscription not found', async () => {
    jest.spyOn(mockRepository, 'getDocument').mockResolvedValue(null);

    await getSubscriptionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTION.id);
    expect(mockRepository.getDocument).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTION.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: RESOURCE_NOT_FOUND_ERROR.responseCode,
      message: RESOURCE_NOT_FOUND_ERROR.responseMessage,
    });
  });

  it('should handle repository errors', async () => {
    const error = new Error('Repository error');
    jest.spyOn(mockRepository, 'getDocument').mockRejectedValue(error);

    await expect(
      getSubscriptionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTION.id);
    expect(mockRepository.getDocument).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTION.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
}); 