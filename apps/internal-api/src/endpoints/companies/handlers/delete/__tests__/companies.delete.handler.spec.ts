import { STATUS_CODES } from '@repo/fastify';
import { CompaniesService } from '@repo/shared/domain';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../../companies.endpoints.constants';
import { STEPS } from '../companies.delete.handler.constants';
import { deleteCompanyHandler } from '../companies.delete.handler';

jest.mock('@repo/shared/domain');
jest.mock('@repo/shared/utils', () => ({
  ...jest.requireActual('@repo/shared/utils'),
  DomainModelServiceError: jest.fn(),
  DomainModelServiceErrorCode: jest.fn(),
}));

describe(deleteCompanyHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockService: Partial<CompaniesService>;

  const mockParams = { id: '123' };
  const logGroup = deleteCompanyHandler.name;

  beforeEach(() => {
    jest.clearAllMocks();
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

    (CompaniesService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );
  });

  it('should successfully delete a company', async () => {
    jest.spyOn(mockService, 'deleteResource').mockResolvedValue(undefined);

    await deleteCompanyHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_COMPANY.id, logGroup);
    expect(mockService.deleteResource).toHaveBeenCalledWith(mockParams.id, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.DELETE_COMPANY.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle non-existent company', async () => {
    jest.spyOn(mockService, 'deleteResource').mockRejectedValue(
      new DomainModelServiceError({
        code: DomainModelServiceErrorCode.RESOURCE_NOT_FOUND,
        message: 'Company not found',
      }),
    );

    await deleteCompanyHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_COMPANY.id, logGroup);
    expect(mockService.deleteResource).toHaveBeenCalledWith(mockParams.id, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.DELETE_COMPANY.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith(
      ERROR_RESPONSES.COMPANY_NOT_FOUND,
    );
  });

  it('should handle service errors', async () => {
    const error = new Error('Service error');
    jest.spyOn(mockService, 'deleteResource').mockRejectedValue(error);

    try {
      await deleteCompanyHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );
      expect(false).toBe(true);
    } catch (error) {
      expect(error).toBe(error);
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_COMPANY.id, logGroup);
      expect(mockService.deleteResource).toHaveBeenCalledWith(mockParams.id, mockLogger);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.DELETE_COMPANY.id);
      expect(mockReply.code).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    }
  });
});
