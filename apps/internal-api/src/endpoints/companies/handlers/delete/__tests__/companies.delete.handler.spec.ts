import { STATUS_CODES } from '@repo/fastify';
import { CompaniesRepository } from '@repo/shared/repositories';
import { RepositoryError, RepositoryErrorCode } from '@repo/shared/utils';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { STEPS } from '../companies.delete.constants';
import { deleteCompanyHandler } from '../companies.delete.handler';
import { ERROR_RESPONSES } from '../../../companies.endpoints.constants';

jest.mock('@repo/shared/repositories');
jest.mock('@repo/shared/utils', () => ({
  ...jest.requireActual('@repo/shared/utils'),
  RepositoryError: jest.fn(),
  RepositoryErrorCode: jest.fn(),
}));

describe(deleteCompanyHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockRepository: Partial<CompaniesRepository>;

  const mockParams = { id: '123' };

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

    mockRepository = {
      deleteDocument: jest.fn(),
    };

    (CompaniesRepository.getInstance as jest.Mock).mockReturnValue(
      mockRepository,
    );
  });

  it('should successfully delete a company', async () => {
    jest.spyOn(mockRepository, 'deleteDocument').mockResolvedValue(undefined);

    await deleteCompanyHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_COMPANY.id);
    expect(mockRepository.deleteDocument).toHaveBeenCalledWith(mockParams.id, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.DELETE_COMPANY.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle non-existent company', async () => {
    jest.spyOn(mockRepository, 'deleteDocument').mockRejectedValue(
      new RepositoryError({
        code: RepositoryErrorCode.DOCUMENT_NOT_FOUND,
        message: 'Company not found',
      }),
    );

    await deleteCompanyHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_COMPANY.id);
    expect(mockRepository.deleteDocument).toHaveBeenCalledWith(mockParams.id, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.DELETE_COMPANY.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith(
      ERROR_RESPONSES.COMPANY_NOT_FOUND,
    );
  });

  it('should handle repository unknown error', async () => {
    const error = new Error('Repository error');
    jest.spyOn(mockRepository, 'deleteDocument').mockRejectedValue(error);

    try {
      await deleteCompanyHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );
      expect(false).toBe(true);
    } catch (error) {
      expect(error).toBe(error);
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_COMPANY.id);
      expect(mockRepository.deleteDocument).toHaveBeenCalledWith(mockParams.id, mockLogger);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.DELETE_COMPANY.id);
      expect(mockReply.code).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    }
  });
});
