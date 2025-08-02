import { transformQueryParams } from '@repo/fastify';
import { FinancialInstitutionsService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { listFinancialInstitutionsHandler } from '../financial-institutions.list.handler';
import { STEPS } from '../financial-institutions.list.handler.constants';

jest.mock('@repo/shared/services');
jest.mock('@repo/fastify', () => ({
  ...jest.requireActual('@repo/fastify'),
  transformQueryParams: jest.fn(),
}));

describe(listFinancialInstitutionsHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: any;
  let mockService: Partial<FinancialInstitutionsService>;
  const logGroup = listFinancialInstitutionsHandler.name;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger,
      query: {
        name_eq: 'Test Bank',
      },
    };

    mockReply = {
      send: jest.fn(),
    };

    mockService = {
      getResourcesList: jest.fn(),
    };

    (FinancialInstitutionsService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );

    (transformQueryParams as jest.Mock).mockReturnValue({
      name: { eq: 'Test Bank' },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should list financial institutions successfully', async () => {
    const mockResult = [
      { id: '1', name: 'Test Bank 1', countryCode: 'US', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', name: 'Test Bank 2', countryCode: 'US', createdAt: new Date(), updatedAt: new Date() },
    ];
    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue(mockResult);

    await listFinancialInstitutionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.child).toHaveBeenCalledWith({
      handler: listFinancialInstitutionsHandler.name,
    });
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.LIST_FINANCIAL_INSTITUTIONS.id, logGroup);
    expect(FinancialInstitutionsService.getInstance).toHaveBeenCalledWith('admin');
    expect(transformQueryParams).toHaveBeenCalledWith(mockRequest.query);
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      { name: { eq: 'Test Bank' } },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.LIST_FINANCIAL_INSTITUTIONS.id);
    expect(mockReply.send).toHaveBeenCalledWith(mockResult);
  });

  it('should handle empty query parameters', async () => {
    mockRequest.query = {};
    const mockResult: any[] = [];
    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue(mockResult);
    (transformQueryParams as jest.Mock).mockReturnValue({});

    await listFinancialInstitutionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(transformQueryParams).toHaveBeenCalledWith({});
    expect(mockService.getResourcesList).toHaveBeenCalledWith({}, mockLogger);
    expect(mockReply.send).toHaveBeenCalledWith(mockResult);
  });

  it('should handle service errors', async () => {
    const mockError = new Error('Service error');
    jest.spyOn(mockService, 'getResourcesList').mockRejectedValue(mockError);

    await expect(
      listFinancialInstitutionsHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(mockError);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.LIST_FINANCIAL_INSTITUTIONS.id, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.LIST_FINANCIAL_INSTITUTIONS.id);
    expect(mockReply.send).not.toHaveBeenCalled();
  });
}); 