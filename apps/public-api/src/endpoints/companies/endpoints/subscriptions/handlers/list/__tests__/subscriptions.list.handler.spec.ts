import { FORBIDDEN_ERROR, mapDateQueryParams, STATUS_CODES, transformQueryParams } from '@repo/fastify';
import { SubscriptionsService } from '@repo/shared/services';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../../../definitions/auth.interfaces';
import { hasCompanySubscriptionsReadPermission } from '../../../../../../../utils/auth/auth.utils';
import { STEPS } from '../subscriptions.list.handler.constants';
import { listSubscriptionsHandler } from '../subscriptions.list.handler';

jest.mock('@repo/fastify', () => ({
  STATUS_CODES: {
    OK: 200,
    FORBIDDEN: 403,
  },
  FORBIDDEN_ERROR: {
    responseCode: 'forbidden',
    responseMessage: 'Forbidden',
  },
  mapDateQueryParams: jest.fn(),
  transformQueryParams: jest.fn(),
}));

jest.mock('@repo/shared/services');
jest.mock('../../../../../../../utils/auth/auth.utils');

describe(listSubscriptionsHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
    child: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockService: Partial<SubscriptionsService>;

  const mockParams = { companyId: 'company123' };
  const mockQuery = { startsAt: '2024-03-20', endsAt: '2024-03-20' };
  const mockMappedQuery = { startsAt: new Date(mockQuery.startsAt), endsAt: new Date(mockQuery.endsAt) };
  const transformedQuery = { companyId: mockParams.companyId, ...mockMappedQuery };
  const mockUser: AuthUser = {
    companies: {
      [mockParams.companyId]: ['subscriptions:read'],
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
      query: mockQuery,
      user: mockUser,
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      getResourcesList: jest.fn(),
    };

    (SubscriptionsService.getInstance as jest.Mock).mockReturnValue(mockService);
    (mapDateQueryParams as jest.Mock).mockReturnValue(mockMappedQuery);
    (transformQueryParams as jest.Mock).mockReturnValue(transformedQuery);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return forbidden when user lacks read permission', async () => {
    (hasCompanySubscriptionsReadPermission as jest.Mock).mockReturnValue(false);

    await listSubscriptionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(hasCompanySubscriptionsReadPermission).toHaveBeenCalledWith(mockParams.companyId, mockUser);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.FORBIDDEN);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
    expect(mockService.getResourcesList).not.toHaveBeenCalled();
  });

  it('should successfully list subscriptions', async () => {
    (hasCompanySubscriptionsReadPermission as jest.Mock).mockReturnValue(true);
    const mockSubscriptions = [{
      id: '1',
      companyId: mockParams.companyId,
      startsAt: new Date(),
      endsAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }];
    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue(mockSubscriptions);

    await listSubscriptionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(hasCompanySubscriptionsReadPermission).toHaveBeenCalledWith(mockParams.companyId, mockUser);
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.LIST_SUBSCRIPTIONS.id);
    expect(mapDateQueryParams).toHaveBeenCalledWith(mockQuery, ['startsAt', 'endsAt']);
    expect(transformQueryParams).toHaveBeenCalledWith({ companyId: mockParams.companyId, ...mockMappedQuery });
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      transformedQuery,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.LIST_SUBSCRIPTIONS.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockSubscriptions);
  });

  it('should handle service errors', async () => {
    (hasCompanySubscriptionsReadPermission as jest.Mock).mockReturnValue(true);
    const error = new Error('Service error');
    jest.spyOn(mockService, 'getResourcesList').mockRejectedValue(error);
    await expect(
      listSubscriptionsHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(hasCompanySubscriptionsReadPermission).toHaveBeenCalledWith(mockParams.companyId, mockUser);
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.LIST_SUBSCRIPTIONS.id);
    expect(mapDateQueryParams).toHaveBeenCalledWith(mockQuery, ['startsAt', 'endsAt']);
    expect(transformQueryParams).toHaveBeenCalledWith({ companyId: mockParams.companyId, ...mockMappedQuery });
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      transformedQuery,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.LIST_SUBSCRIPTIONS.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
