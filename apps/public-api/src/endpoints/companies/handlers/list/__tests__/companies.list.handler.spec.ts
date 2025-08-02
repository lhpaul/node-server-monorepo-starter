import { STATUS_CODES } from '@repo/fastify';
import { CompaniesService } from '@repo/shared/services';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../definitions/auth.interfaces';
import { STEPS } from '../companies.list.handler.constants';
import { listCompaniesHandler } from '../companies.list.handler';

jest.mock('@repo/fastify', () => ({
  STATUS_CODES: {
    OK: 200,
  },
}));

jest.mock('@repo/shared/services');

describe(listCompaniesHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: Partial<FastifyBaseLogger>;
  let mockService: Partial<CompaniesService>;
  let mockUser: AuthUser;
  const logGroup = listCompaniesHandler.name;
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
      userId: 'user123',
      companies: {
        'company-1': ['company:read'],
        'company-2': ['company:write'],
        'company-3': ['company:update'],
      },
    } as AuthUser;

    mockRequest = {
      log: mockLogger as FastifyBaseLogger,
      user: mockUser,
    };
    mockService = {
      getResource: jest.fn(),
    };

    (CompaniesService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );
  });

  it('should return list of companies user has access to', async () => {
    const mockCompanies = [
      { id: 'company-1', name: 'Company 1', countryCode: 'US', createdAt: new Date(), updatedAt: new Date() },
      { id: 'company-2', name: 'Company 2', countryCode: 'CA', createdAt: new Date(), updatedAt: new Date() },
      { id: 'company-3', name: 'Company 3', countryCode: 'GB', createdAt: new Date(), updatedAt: new Date() },
    ];
    jest.spyOn(mockService, 'getResource').mockImplementation((id) => Promise.resolve(mockCompanies.find((company) => company.id === id) ?? null));

    await listCompaniesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id, logGroup);
    expect(mockService.getResource).toHaveBeenCalledTimes(3);
    expect(mockService.getResource).toHaveBeenCalledWith('company-1', mockLogger);
    expect(mockService.getResource).toHaveBeenCalledWith('company-2', mockLogger);
    expect(mockService.getResource).toHaveBeenCalledWith('company-3', mockLogger);
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

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id, logGroup);
    expect(mockService.getResource).not.toHaveBeenCalled();
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith([]);
  });

  it('should filter out null companies', async () => {
    const mockCompanies = [
      { id: 'company-1', name: 'Company 1', countryCode: 'US', createdAt: new Date(), updatedAt: new Date() },
      { id: 'company-3', name: 'Company 3', countryCode: 'GB', createdAt: new Date(), updatedAt: new Date() },
    ];

    jest.spyOn(mockService, 'getResource')
      .mockResolvedValueOnce(mockCompanies[0])
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockCompanies[1]);

    await listCompaniesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id, logGroup);
    expect(mockService.getResource).toHaveBeenCalledTimes(3);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockCompanies);
  });

  it('should handle service errors', async () => {
    const error = new Error('Service error');
    jest.spyOn(mockService, 'getResource').mockRejectedValue(error);

    await expect(
      listCompaniesHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id, logGroup);
    expect(mockService.getResource).toHaveBeenCalled();
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
}); 