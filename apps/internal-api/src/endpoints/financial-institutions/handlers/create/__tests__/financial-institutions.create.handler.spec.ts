import { STATUS_CODES } from '@repo/fastify';
import { FinancialInstitutionsService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { createFinancialInstitutionHandler } from '../financial-institutions.create.handler';
import { STEPS } from '../financial-institutions.create.handler.constants';

jest.mock('@repo/shared/domain');

describe(createFinancialInstitutionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: any;
  let mockService: Partial<FinancialInstitutionsService>;
  const logGroup = createFinancialInstitutionHandler.name;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger,
      body: {
        name: 'Test Bank',
      },
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      createResource: jest.fn(),
    };

    (FinancialInstitutionsService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a financial institution successfully', async () => {
    const mockFinancialInstitutionId = '123';
    jest.spyOn(mockService, 'createResource').mockResolvedValue(mockFinancialInstitutionId);

    await createFinancialInstitutionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.child).toHaveBeenCalledWith({
      handler: createFinancialInstitutionHandler.name,
    });
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CREATE_FINANCIAL_INSTITUTION.id, logGroup);
    expect(FinancialInstitutionsService.getInstance).toHaveBeenCalled();
    expect(mockService.createResource).toHaveBeenCalledWith(
      mockRequest.body,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.CREATE_FINANCIAL_INSTITUTION.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.CREATED);
    expect(mockReply.send).toHaveBeenCalledWith({ id: mockFinancialInstitutionId });
  });

  it('should handle service errors', async () => {
    const mockError = new Error('Service error');
    jest.spyOn(mockService, 'createResource').mockRejectedValue(mockError);

    await expect(
      createFinancialInstitutionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(mockError);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CREATE_FINANCIAL_INSTITUTION.id, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.CREATE_FINANCIAL_INSTITUTION.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
}); 