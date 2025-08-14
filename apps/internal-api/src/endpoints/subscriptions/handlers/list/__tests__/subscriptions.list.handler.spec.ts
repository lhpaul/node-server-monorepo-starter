import { STATUS_CODES, transformQueryParams } from '@repo/fastify';
import { SubscriptionsService } from '@repo/shared/domain';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { listSubscriptionsHandler } from '../subscriptions.list.handler';
import { STEPS } from '../subscriptions.list.handler.constants';

jest.mock('@repo/fastify', () => ({
  STATUS_CODES: {
    OK: 200,
  },
  transformQueryParams: jest.fn(),
}));

jest.mock('@repo/shared/domain');

describe(listSubscriptionsHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
    child: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockService: Partial<SubscriptionsService>;
  const logGroup = listSubscriptionsHandler.name;
  const mockQuery = { companyId: 'company123' };

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger as FastifyBaseLogger,
      query: mockQuery,
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      getResourcesList: jest.fn(),
    };

    (SubscriptionsService.getInstance as jest.Mock).mockReturnValue(mockService);
    (transformQueryParams as jest.Mock).mockReturnValue({ companyId: 'company123' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully list subscriptions', async () => {
    const mockSubscriptions = [{
      id: '1',
      companyId: 'company123',
      startsAt: new Date('2024-01-01'),
      endsAt: new Date('2024-12-31'),
      createdAt: new Date(),
      updatedAt: new Date(),
    }];
    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue(mockSubscriptions);

    await listSubscriptionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTIONS, logGroup);
    expect(transformQueryParams).toHaveBeenCalledWith(mockQuery);
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      { companyId: mockQuery.companyId },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTIONS);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockSubscriptions);
  });

  it('should handle empty subscriptions list', async () => {
    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue([]);

    await listSubscriptionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTIONS, logGroup);
    expect(transformQueryParams).toHaveBeenCalledWith(mockQuery);
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      { companyId: mockQuery.companyId },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_SUBSCRIPTIONS);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith([]);
  });
}); 