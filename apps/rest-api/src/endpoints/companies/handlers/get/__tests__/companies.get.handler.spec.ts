import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';
import { CompaniesRepository } from '@repo/shared/repositories';

import { ERROR_RESPONSES } from '../../../companies.endpoints.constants';
import { STEPS } from '../companies.get.constants';
import { getCompanyHandler } from '../companies.get.handler';

jest.mock('@repo/shared/repositories', () => ({
  CompaniesRepository: {
    getInstance: jest.fn().mockImplementation(() => ({
      getCompanyById: jest.fn(),
    })),
  },
}));

describe(getCompanyHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockRepository: { getCompanyById: jest.Mock };

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
      getCompanyById: jest.fn(),
    };

    (CompaniesRepository.getInstance as jest.Mock).mockReturnValue(
      mockRepository,
    );
  });

  it('should successfully retrieve a company', async () => {
    const mockCompany = {
      id: mockParams.id,
      name: 'Test Company',
    };

    mockRepository.getCompanyById.mockResolvedValue(mockCompany);

    await getCompanyHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.GET_COMPANY.id,
      STEPS.GET_COMPANY.obfuscatedId,
    );
    expect(mockRepository.getCompanyById).toHaveBeenCalledWith(mockParams.id, {
      logger: mockLogger,
    });
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANY.id);
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith(mockCompany);
  });

  it('should handle company not found', async () => {
    mockRepository.getCompanyById.mockResolvedValue(null);

    await getCompanyHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.GET_COMPANY.id,
      STEPS.GET_COMPANY.obfuscatedId,
    );
    expect(mockRepository.getCompanyById).toHaveBeenCalledWith(mockParams.id, {
      logger: mockLogger,
    });
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANY.id);
    expect(mockReply.code).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith(
      ERROR_RESPONSES.COMPANY_NOT_FOUND,
    );
  });

  it('should handle repository errors', async () => {
    const error = new Error('Repository error');
    mockRepository.getCompanyById.mockRejectedValue(error);

    await expect(
      getCompanyHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.GET_COMPANY.id,
      STEPS.GET_COMPANY.obfuscatedId,
    );
    expect(mockRepository.getCompanyById).toHaveBeenCalledWith(mockParams.id, {
      logger: mockLogger,
    });
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANY.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
