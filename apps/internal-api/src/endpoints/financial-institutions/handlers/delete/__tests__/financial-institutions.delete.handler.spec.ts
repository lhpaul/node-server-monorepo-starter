import { STATUS_CODES } from '@repo/fastify';
import { FinancialInstitutionsService } from '@repo/shared/domain';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../../financial-institutions.endpoints.constants';
import { STEPS } from '../financial-institutions.delete.handler.constants';
import { deleteFinancialInstitutionHandler } from '../financial-institutions.delete.handler';

jest.mock('@repo/shared/domain');
jest.mock('@repo/shared/utils', () => ({
  ...jest.requireActual('@repo/shared/utils'),
  DomainModelServiceError: jest.fn(),
  DomainModelServiceErrorCode: jest.fn(),
}));

describe(deleteFinancialInstitutionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockService: Partial<FinancialInstitutionsService>;
  let mockLogger: Partial<FastifyBaseLogger>;

  const mockParams = { id: 'test-id' };
  const logGroup = deleteFinancialInstitutionHandler.name;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger as FastifyBaseLogger,
      params: mockParams,
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      deleteResource: jest.fn(),
    };

    (FinancialInstitutionsService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully delete a financial institution', async () => {
    jest.spyOn(mockService, 'deleteResource').mockResolvedValue();

    await deleteFinancialInstitutionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_FINANCIAL_INSTITUTION.id, logGroup);
    expect(FinancialInstitutionsService.getInstance).toHaveBeenCalled();
    expect(mockService.deleteResource).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.DELETE_FINANCIAL_INSTITUTION.id,
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle non-existent financial institution', async () => {
    jest.spyOn(mockService, 'deleteResource').mockRejectedValue(
      new DomainModelServiceError({
        code: DomainModelServiceErrorCode.RESOURCE_NOT_FOUND,
        message: 'Financial institution not found',
      }),
    );

    await deleteFinancialInstitutionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_FINANCIAL_INSTITUTION.id, logGroup);
    expect(mockService.deleteResource).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.DELETE_FINANCIAL_INSTITUTION.id,
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith(
      ERROR_RESPONSES.FINANCIAL_INSTITUTION_NOT_FOUND,
    );
  });

  it('should rethrow non-DomainModelServiceError errors', async () => {
    const error = new Error('Unexpected error');
    jest.spyOn(mockService, 'deleteResource').mockRejectedValue(error);

    await expect(
      deleteFinancialInstitutionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_FINANCIAL_INSTITUTION.id, logGroup);
    expect(mockService.deleteResource).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.DELETE_FINANCIAL_INSTITUTION.id,
    );
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
}); 