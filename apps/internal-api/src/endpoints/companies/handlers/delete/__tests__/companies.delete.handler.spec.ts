import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';
import {
  CompaniesRepository,
  DeleteCompanyError,
  DeleteCompanyErrorCode,
} from '@repo/shared/repositories';

import { ERROR_RESPONSES } from '../../../companies.endpoints.constants';
import { STEPS } from '../companies.delete.constants';
import { deleteCompanyHandler } from '../companies.delete.handler';

jest.mock('@repo/shared/repositories', () => ({
  ...jest.requireActual('@repo/shared/repositories'),
  CompaniesRepository: {
    getInstance: jest.fn().mockImplementation(() => ({
      deleteCompany: jest.fn(),
    })),
  },
}));

describe(deleteCompanyHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockRepository: { deleteCompany: jest.Mock };

  const mockParams = { id: '123' };

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

    mockRepository = {
      deleteCompany: jest.fn(),
    };

    (CompaniesRepository.getInstance as jest.Mock).mockReturnValue(
      mockRepository,
    );
  });

  it('should successfully delete a company', async () => {
    mockRepository.deleteCompany.mockResolvedValue(true);

    await deleteCompanyHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.DELETE_COMPANY.id,
      STEPS.DELETE_COMPANY.obfuscatedId,
    );
    expect(mockRepository.deleteCompany).toHaveBeenCalledWith(mockParams.id, {
      logger: mockLogger,
    });
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.DELETE_COMPANY.id);
    expect(mockReply.code).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle non-existent company', async () => {
    mockRepository.deleteCompany.mockRejectedValue(
      new DeleteCompanyError({
        code: DeleteCompanyErrorCode.DOCUMENT_NOT_FOUND,
        message: 'Company not found',
      }),
    );

    await deleteCompanyHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.DELETE_COMPANY.id,
      STEPS.DELETE_COMPANY.obfuscatedId,
    );
    expect(mockRepository.deleteCompany).toHaveBeenCalledWith(mockParams.id, {
      logger: mockLogger,
    });
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.DELETE_COMPANY.id);
    expect(mockReply.code).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith(
      ERROR_RESPONSES.COMPANY_NOT_FOUND,
    );
  });

  it('should handle repository unknown error', async () => {
    const error = new Error('Repository error');
    mockRepository.deleteCompany.mockRejectedValue(error);

    await expect(
      deleteCompanyHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.DELETE_COMPANY.id,
      STEPS.DELETE_COMPANY.obfuscatedId,
    );
    expect(mockRepository.deleteCompany).toHaveBeenCalledWith(mockParams.id, {
      logger: mockLogger,
    });
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.DELETE_COMPANY.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
