import { STATUS_CODES, transformQueryParams } from '@repo/fastify';
import { FinancialInstitutionsService } from '@repo/shared/domain';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { listFinancialInstitutionsHandler } from '../financial-institutions.list.handler';
import { STEPS } from '../financial-institutions.list.handler.constants';
import { ListFinancialInstitutionsQuery } from '../financial-institutions.list.handler.interfaces';

jest.mock('@repo/fastify', () => ({
  STATUS_CODES: {
    OK: 200,
  },
  transformQueryParams: jest.fn(),
}));

jest.mock('@repo/shared/domain');

describe(listFinancialInstitutionsHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: Partial<FastifyBaseLogger>;
  let mockService: Partial<FinancialInstitutionsService>;
  let mockQuery: ListFinancialInstitutionsQuery;
  const logGroup = listFinancialInstitutionsHandler.name;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
      error: jest.fn(),
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockQuery = {};
    mockRequest = {
      log: mockLogger as FastifyBaseLogger,
      query: mockQuery,
    };

    mockService = {
      getResourcesList: jest.fn(),
    };

    (FinancialInstitutionsService.getInstance as jest.Mock).mockReturnValue(mockService);
    (transformQueryParams as jest.Mock).mockReturnValue({ filter: {}, limit: 1000 });
  });

  it('should return list of all financial institutions', async () => {
    const mockFinancialInstitutions = [
      { 
        id: 'fi-1', 
        name: 'Bank of America',
        countryCode: 'US',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        id: 'fi-2', 
        name: 'Chase Bank',
        countryCode: 'US',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ];

    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue(mockFinancialInstitutions);

    await listFinancialInstitutionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.LIST_FINANCIAL_INSTITUTIONS.id, logGroup);
    expect(transformQueryParams).toHaveBeenCalledWith(mockQuery);
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      { filter: {}, limit: 1000 },
      mockLogger
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.LIST_FINANCIAL_INSTITUTIONS.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockFinancialInstitutions);
  });

  it('should handle filtering by name', async () => {
    mockQuery = { name: 'Bank' };
    mockRequest.query = mockQuery;

    const mockFilteredInstitutions = [
      { 
        id: 'fi-1', 
        name: 'Bank of America',
        countryCode: 'US',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ];

    (transformQueryParams as jest.Mock).mockReturnValue({ 
      filter: { name: [{ operator: 'eq', value: 'Bank' }] }, 
      limit: 1000 
    });

    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue(mockFilteredInstitutions);

    await listFinancialInstitutionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(transformQueryParams).toHaveBeenCalledWith(mockQuery);
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      { filter: { name: [{ operator: 'eq', value: 'Bank' }] }, limit: 1000 },
      mockLogger
    );
    expect(mockReply.send).toHaveBeenCalledWith(mockFilteredInstitutions);
  });

  it('should handle empty result set', async () => {
    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue([]);

    await listFinancialInstitutionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.LIST_FINANCIAL_INSTITUTIONS.id, logGroup);
    expect(mockService.getResourcesList).toHaveBeenCalled();
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.LIST_FINANCIAL_INSTITUTIONS.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith([]);
  });

  it('should handle service errors', async () => {
    const error = new Error('Service error');
    jest.spyOn(mockService, 'getResourcesList').mockRejectedValue(error);

    await expect(
      listFinancialInstitutionsHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.LIST_FINANCIAL_INSTITUTIONS.id, logGroup);
    expect(mockService.getResourcesList).toHaveBeenCalled();
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.LIST_FINANCIAL_INSTITUTIONS.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should create logger with correct context', async () => {
    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue([]);

    await listFinancialInstitutionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.child).toHaveBeenCalledWith({ 
      handler: listFinancialInstitutionsHandler.name 
    });
  });

  it('should handle query with undefined values', async () => {
    mockQuery = { name: undefined };
    mockRequest.query = mockQuery;

    const mockInstitutions = [
      { 
        id: 'fi-1', 
        name: 'Bank of America',
        countryCode: 'US',
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ];

    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue(mockInstitutions);

    await listFinancialInstitutionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(transformQueryParams).toHaveBeenCalledWith(mockQuery);
    expect(mockService.getResourcesList).toHaveBeenCalled();
    expect(mockReply.send).toHaveBeenCalledWith(mockInstitutions);
  });
}); 