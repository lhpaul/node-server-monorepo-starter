import { STATUS_CODES } from '@repo/fastify';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';
import { CompaniesRepository } from '@repo/shared/repositories';

import { STEPS } from '../companies.delete.constants';
import { deleteCompanyHandler } from '../companies.delete.handler';

jest.mock('@repo/shared/repositories');

describe(deleteCompanyHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockRepository: { deleteDocument: jest.Mock };

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
      deleteDocument: jest.fn(),
    };

    (CompaniesRepository.getInstance as jest.Mock).mockReturnValue(
      mockRepository,
    );
  });

  it('should successfully delete a company', async () => {
    mockRepository.deleteDocument.mockResolvedValue(undefined);

    await deleteCompanyHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.DELETE_COMPANY.id,
      STEPS.DELETE_COMPANY.obfuscatedId,
    );
    expect(mockRepository.deleteDocument).toHaveBeenCalledWith(mockParams.id, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.DELETE_COMPANY.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle repository unknown error', async () => {
    const error = new Error('Repository error');
    mockRepository.deleteDocument.mockRejectedValue(error);

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
    expect(mockRepository.deleteDocument).toHaveBeenCalledWith(mockParams.id, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.DELETE_COMPANY.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
