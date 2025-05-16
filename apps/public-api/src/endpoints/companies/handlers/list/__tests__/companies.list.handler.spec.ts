import { FastifyReply, FastifyRequest } from 'fastify';
import { CompaniesRepository } from '@repo/shared/repositories';

import { listCompaniesHandler } from '../companies.list.handler';
import { STEPS } from '../companies.list.constants';

jest.mock('@repo/shared/repositories', () => ({
  CompaniesRepository: {
    getInstance: jest.fn().mockImplementation(() => ({
      getCompanies: jest.fn(),
    })),
  },
}));

describe(listCompaniesHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockRepository: jest.Mocked<CompaniesRepository>;
  let mockLogger: any;
  const mockCompanies = [
    { id: '1', name: 'Company 1' },
    { id: '2', name: 'Company 2' },
    { id: '3', name: 'Company 3' },
  ];

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger,
      query: {},
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockRepository = {
      getCompanies: jest.fn(),
    } as any;

    (CompaniesRepository.getInstance as jest.Mock).mockReturnValue(
      mockRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all companies when no query parameters are provided', async () => {
    mockRepository.getCompanies.mockResolvedValue(mockCompanies);

    await listCompaniesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.GET_COMPANIES.id,
      STEPS.GET_COMPANIES.obfuscatedId,
    );
    expect(mockRepository.getCompanies).toHaveBeenCalledWith(
      {},
      { logger: mockLogger },
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id);
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith(mockCompanies);
  });

  it('should filter companies based on query parameters', async () => {
    const queryParams = {
      name: 'Company 1',
    };
    mockRequest.query = queryParams;
    const filteredCompanies = [mockCompanies[0]];
    mockRepository.getCompanies.mockResolvedValue(filteredCompanies);

    await listCompaniesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.GET_COMPANIES.id,
      STEPS.GET_COMPANIES.obfuscatedId,
    );
    expect(mockRepository.getCompanies).toHaveBeenCalledWith(
      {
        name: [{ operator: '==', value: 'Company 1' }],
      },
      { logger: mockLogger },
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id);
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith(filteredCompanies);
  });

  it('should handle empty result set', async () => {
    mockRepository.getCompanies.mockResolvedValue([]);

    await listCompaniesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.GET_COMPANIES.id,
      STEPS.GET_COMPANIES.obfuscatedId,
    );
    expect(mockRepository.getCompanies).toHaveBeenCalledWith(
      {},
      { logger: mockLogger },
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id);
    expect(mockReply.code).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith([]);
  });

  it('should handle repository errors', async () => {
    const error = new Error('Repository error');
    mockRepository.getCompanies.mockRejectedValue(error);

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
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
