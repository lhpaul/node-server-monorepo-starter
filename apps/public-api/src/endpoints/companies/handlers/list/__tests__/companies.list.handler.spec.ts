import { STATUS_CODES } from '@repo/fastify';
import { CompaniesRepository } from '@repo/shared/repositories';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../definitions/auth.interfaces';
import { STEPS } from '../companies.list.constants';
import { listCompaniesHandler } from '../companies.list.handler';

jest.mock('@repo/fastify', () => ({
  STATUS_CODES: {
    OK: 200,
  },
}));

jest.mock('@repo/shared/repositories', () => ({
  CompaniesRepository: {
    getInstance: jest.fn().mockImplementation(() => ({
      getCompanyById: jest.fn(),
    })),
  },
}));

describe(listCompaniesHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: Partial<FastifyBaseLogger>;
  let mockRepository: { getCompanyById: jest.Mock };
  let mockUser: AuthUser;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
      error: jest.fn(),
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockUser = {
      companies: {
        'company-1': ['company:read'],
        'company-2': ['company:write'],
        'company-3': ['company:update'],
      },
    } as unknown as AuthUser;

    mockRequest = {
      log: mockLogger as FastifyBaseLogger,
      user: mockUser,
    };
    mockRepository = {
      getCompanyById: jest.fn(),
    };

    (CompaniesRepository.getInstance as jest.Mock).mockReturnValue(
      mockRepository,
    );
  });

  it('should handle user without companies', async () => {
    mockUser.companies = undefined;
    mockRequest.user = mockUser;

    await listCompaniesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.GET_COMPANIES.id,
      STEPS.GET_COMPANIES.obfuscatedId,
    );
    expect(mockRepository.getCompanyById).not.toHaveBeenCalled();
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id);
  });

  it('should return list of companies user has access to', async () => {
    const mockCompanies = [
      { id: 'company-1', name: 'Company 1', createdAt: new Date(), updatedAt: new Date() },
      { id: 'company-2', name: 'Company 2', createdAt: new Date(), updatedAt: new Date() },
      { id: 'company-3', name: 'Company 3', createdAt: new Date(), updatedAt: new Date() },
    ];
    mockRepository.getCompanyById.mockImplementation((id) => Promise.resolve(mockCompanies.find((company) => company.id === id) ?? null));

    await listCompaniesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.GET_COMPANIES.id,
      STEPS.GET_COMPANIES.obfuscatedId,
    );
    expect(mockRepository.getCompanyById).toHaveBeenCalledTimes(3);
    expect(mockRepository.getCompanyById).toHaveBeenCalledWith('company-1', { logger: mockLogger });
    expect(mockRepository.getCompanyById).toHaveBeenCalledWith('company-2', { logger: mockLogger });
    expect(mockRepository.getCompanyById).toHaveBeenCalledWith('company-3', { logger: mockLogger });
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockCompanies);
  });

  it('should handle empty permissions', async () => {
    mockUser.companies = {};
    mockRequest.user = mockUser;

    await listCompaniesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.GET_COMPANIES.id,
      STEPS.GET_COMPANIES.obfuscatedId,
    );
    expect(mockRepository.getCompanyById).not.toHaveBeenCalled();
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith([]);
  });

  it('should filter out null companies', async () => {
    const mockCompanies = [
      { id: 'company-1', name: 'Company 1', createdAt: new Date(), updatedAt: new Date() },
      { id: 'company-3', name: 'Company 3', createdAt: new Date(), updatedAt: new Date() },
    ];

    mockRepository.getCompanyById
      .mockResolvedValueOnce(mockCompanies[0])
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockCompanies[1]);

    await listCompaniesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.GET_COMPANIES.id,
      STEPS.GET_COMPANIES.obfuscatedId,
    );
    expect(mockRepository.getCompanyById).toHaveBeenCalledTimes(3);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockCompanies);
  });

  it('should handle repository errors', async () => {
    const error = new Error('Repository error');
    mockRepository.getCompanyById.mockRejectedValue(error);

    await expect(
      listCompaniesHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.GET_COMPANIES.id,
      STEPS.GET_COMPANIES.obfuscatedId,
    );
    expect(mockRepository.getCompanyById).toHaveBeenCalled();
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
}); 