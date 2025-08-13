import { STATUS_CODES } from '@repo/fastify';
import { CompaniesService } from '@repo/shared/domain';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../../companies.endpoints.constants';
import { STEPS } from '../companies.get.handler.constants';
import { getCompanyHandler } from '../companies.get.handler';

jest.mock('@repo/shared/domain');

describe(getCompanyHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockService: Partial<CompaniesService>;

  const mockParams = { id: '123' };
  const logGroup = getCompanyHandler.name;

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
      getResource: jest.fn(),
    };

    (CompaniesService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );
  });

  it('should successfully retrieve a company', async () => {
    const mockCompany = {
      id: mockParams.id,
      name: 'Test Company',
      countryCode: 'US',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(mockService, 'getResource').mockResolvedValue(mockCompany);

    await getCompanyHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_COMPANY.id, logGroup);
    expect(mockService.getResource).toHaveBeenCalledWith(mockParams.id, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANY.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockCompany);
  });

  it('should handle company not found', async () => {
    jest.spyOn(mockService, 'getResource').mockResolvedValue(null);

    await getCompanyHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_COMPANY.id, logGroup);
    expect(mockService.getResource).toHaveBeenCalledWith(mockParams.id, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANY.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith(
      ERROR_RESPONSES.COMPANY_NOT_FOUND,
    );
  });

  it('should handle service errors', async () => {
    const error = new Error('Service error');
    jest.spyOn(mockService, 'getResource').mockRejectedValue(error);

    await expect(
      getCompanyHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_COMPANY.id, logGroup);
    expect(mockService.getResource).toHaveBeenCalledWith(mockParams.id, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANY.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
