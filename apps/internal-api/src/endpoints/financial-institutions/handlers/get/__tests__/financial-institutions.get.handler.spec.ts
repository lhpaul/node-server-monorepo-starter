import { FinancialInstitutionsService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { getFinancialInstitutionHandler } from '../financial-institutions.get.handler';
import { STEPS } from '../financial-institutions.get.handler.constants';

jest.mock('@repo/shared/services');

describe(getFinancialInstitutionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: any;
  let mockService: Partial<FinancialInstitutionsService>;
  const logGroup = getFinancialInstitutionHandler.name;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger,
      params: {
        id: '123',
      },
    };

    mockReply = {
      send: jest.fn(),
    };

    mockService = {
      getResource: jest.fn(),
    };

    (FinancialInstitutionsService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get a financial institution successfully', async () => {
    const mockFinancialInstitution = {
      id: '123',
      name: 'Test Bank',
      countryCode: 'US',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(mockService, 'getResource').mockResolvedValue(mockFinancialInstitution);

    await getFinancialInstitutionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.child).toHaveBeenCalledWith({
      handler: getFinancialInstitutionHandler.name,
    });
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_FINANCIAL_INSTITUTION.id, logGroup);
    expect(FinancialInstitutionsService.getInstance).toHaveBeenCalledWith('admin');
    expect(mockService.getResource).toHaveBeenCalledWith(
      '123',
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_FINANCIAL_INSTITUTION.id);
    expect(mockReply.send).toHaveBeenCalledWith(mockFinancialInstitution);
  });

  it('should handle service errors', async () => {
    const mockError = new Error('Service error');
    jest.spyOn(mockService, 'getResource').mockRejectedValue(mockError);

    await expect(
      getFinancialInstitutionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(mockError);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_FINANCIAL_INSTITUTION.id, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_FINANCIAL_INSTITUTION.id);
    expect(mockReply.send).not.toHaveBeenCalled();
  });
}); 