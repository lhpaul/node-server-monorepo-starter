import { FastifyReply, FastifyRequest } from 'fastify';
import { CompaniesRepository } from '@repo/shared/repositories';

import { createCompanyHandler } from '../companies.create.handler';
import { STEPS } from '../companies.create.constants';

jest.mock('@repo/shared/repositories');

describe(createCompanyHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: any;
  let mockRepository: jest.Mocked<CompaniesRepository>;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger,
      body: {
        name: 'Test Company',
      },
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockRepository = {
      createCompany: jest.fn(),
    } as any;

    (CompaniesRepository.getInstance as jest.Mock).mockReturnValue(
      mockRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a company successfully', async () => {
    const mockCompanyId = '123';
    mockRepository.createCompany.mockResolvedValue({
      id: mockCompanyId,
    });

    await createCompanyHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.child).toHaveBeenCalledWith({
      handler: createCompanyHandler.name,
    });
    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.CREATE_COMPANY.id,
      STEPS.CREATE_COMPANY.obfuscatedId,
    );
    expect(mockRepository.createCompany).toHaveBeenCalledWith(
      mockRequest.body,
      { logger: mockLogger },
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.CREATE_COMPANY.id);
    expect(mockReply.code).toHaveBeenCalledWith(201);
    expect(mockReply.send).toHaveBeenCalledWith({ id: mockCompanyId });
  });

  it('should handle repository errors', async () => {
    const mockError = new Error('Repository error');
    mockRepository.createCompany.mockRejectedValue(mockError);

    await expect(
      createCompanyHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(mockError);

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.CREATE_COMPANY.id,
      STEPS.CREATE_COMPANY.obfuscatedId,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.CREATE_COMPANY.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
