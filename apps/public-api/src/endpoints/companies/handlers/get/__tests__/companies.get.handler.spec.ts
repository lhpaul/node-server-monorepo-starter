import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { CompaniesRepository } from '@repo/shared/repositories';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { hasCompanyReadPermission } from '../../../../../utils/auth/auth.utils';
import { COMPANY_NOT_FOUND_ERROR } from '../../../companies.endpoints.constants';
import { STEPS } from '../companies.get.constants';
import { getCompanyHandler } from '../companies.get.handler';

jest.mock('@repo/fastify', () => ({
  STATUS_CODES: {
    OK: 200,
    FORBIDDEN: 403
  },
  FORBIDDEN_ERROR: {
    responseCode: 'forbidden',
    responseMessage: 'Forbidden request'
  }
}));

jest.mock('@repo/shared/repositories');

jest.mock('../../../../../utils/auth/auth.utils', () => ({
  hasCompanyReadPermission: jest.fn(),
}));

describe(getCompanyHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockRepository: Partial<CompaniesRepository>;

  const mockParams = { id: '123' };
  const mockUser = { id: 'user123' };

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger as FastifyBaseLogger,
      params: mockParams,
      user: mockUser,
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockRepository = {
      getDocument: jest.fn(),
    };

    (CompaniesRepository.getInstance as jest.Mock).mockReturnValue(
      mockRepository,
    );

    (hasCompanyReadPermission as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully retrieve a company', async () => {
    const mockCompany = {
      id: mockParams.id,
      name: 'Test Company',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(mockRepository, 'getDocument').mockResolvedValue(mockCompany);

    await getCompanyHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(hasCompanyReadPermission).toHaveBeenCalledWith(mockParams.id, mockUser);
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_COMPANY.id);
    expect(mockRepository.getDocument).toHaveBeenCalledWith(mockParams.id, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANY.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockCompany);
  });

  it('should handle forbidden access', async () => {
    (hasCompanyReadPermission as jest.Mock).mockReturnValue(false);

    await getCompanyHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(hasCompanyReadPermission).toHaveBeenCalledWith(mockParams.id, mockUser);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.FORBIDDEN);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
    expect(mockRepository.getDocument).not.toHaveBeenCalled();
  });

  it('should throw error when company not found', async () => {
    jest.spyOn(mockRepository, 'getDocument').mockResolvedValue(null);

    await expect(
      getCompanyHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(COMPANY_NOT_FOUND_ERROR(mockParams.id));

    expect(hasCompanyReadPermission).toHaveBeenCalledWith(mockParams.id, mockUser);
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_COMPANY.id);
    expect(mockRepository.getDocument).toHaveBeenCalledWith(mockParams.id, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANY.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const error = new Error('Repository error');
    jest.spyOn(mockRepository, 'getDocument').mockRejectedValue(error);

    await expect(
      getCompanyHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(hasCompanyReadPermission).toHaveBeenCalledWith(mockParams.id, mockUser);
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_COMPANY.id);
    expect(mockRepository.getDocument).toHaveBeenCalledWith(mockParams.id, mockLogger);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
