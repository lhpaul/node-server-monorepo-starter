import { FinancialInstitutionsService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { updateFinancialInstitutionHandler } from '../financial-institutions.update.handler';
import { STEPS } from '../financial-institutions.update.handler.constants';

jest.mock('@repo/shared/services');

describe(updateFinancialInstitutionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: any;
  let mockService: Partial<FinancialInstitutionsService>;
  const logGroup = updateFinancialInstitutionHandler.name;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger,
      body: {
        name: 'Updated Bank Name',
      },
      params: {
        id: '123',
      },
    };

    mockReply = {
      send: jest.fn(),
    };

    mockService = {
      updateResource: jest.fn(),
    };

    (FinancialInstitutionsService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update a financial institution successfully', async () => {
    jest.spyOn(mockService, 'updateResource').mockResolvedValue();

    await updateFinancialInstitutionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.child).toHaveBeenCalledWith({
      handler: updateFinancialInstitutionHandler.name,
    });
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_FINANCIAL_INSTITUTION.id, logGroup);
    expect(FinancialInstitutionsService.getInstance).toHaveBeenCalledWith('admin');
    expect(mockService.updateResource).toHaveBeenCalledWith(
      '123',
      { name: 'Updated Bank Name' },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_FINANCIAL_INSTITUTION.id);
    expect(mockReply.send).toHaveBeenCalledWith(undefined);
  });

  it('should handle partial updates', async () => {
    mockRequest.body = { name: 'Partial Update' };
    jest.spyOn(mockService, 'updateResource').mockResolvedValue();

    await updateFinancialInstitutionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockService.updateResource).toHaveBeenCalledWith(
      '123',
      { name: 'Partial Update' },
      mockLogger,
    );
    expect(mockReply.send).toHaveBeenCalledWith(undefined);
  });

  it('should handle service errors', async () => {
    const mockError = new Error('Service error');
    jest.spyOn(mockService, 'updateResource').mockRejectedValue(mockError);

    await expect(
      updateFinancialInstitutionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(mockError);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_FINANCIAL_INSTITUTION.id, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_FINANCIAL_INSTITUTION.id);
    expect(mockReply.send).not.toHaveBeenCalled();
  });
}); 