import { STATUS_CODES } from '@repo/fastify';
import { CompaniesRepository } from '@repo/shared/repositories';
import { FastifyReply, FastifyRequest } from 'fastify';

import { listCompaniesHandler } from '../companies.list.handler';
import { STEPS } from '../companies.list.handler.constants';

jest.mock('@repo/shared/repositories');

describe(listCompaniesHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockRepository: Partial<CompaniesRepository>;
  let mockLogger: any;
  const mockCompanies = [
    { id: '1', name: 'Company 1', createdAt: new Date(), updatedAt: new Date() },
    { id: '2', name: 'Company 2', createdAt: new Date(), updatedAt: new Date() },
    { id: '3', name: 'Company 3', createdAt: new Date(), updatedAt: new Date() },
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
      getDocumentsList: jest.fn(),
    };

    (CompaniesRepository.getInstance as jest.Mock).mockReturnValue(
      mockRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all companies when no query parameters are provided', async () => {
    jest.spyOn(mockRepository, 'getDocumentsList').mockResolvedValue(mockCompanies);

    await listCompaniesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id);
    expect(mockRepository.getDocumentsList).toHaveBeenCalledWith(
      {},
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockCompanies);
  });

  it('should filter companies based on query parameters', async () => {
    const queryParams = {
      name: 'Company 1',
    };
    mockRequest.query = queryParams;
    const filteredCompanies = [mockCompanies[0]];
    jest.spyOn(mockRepository, 'getDocumentsList').mockResolvedValue(filteredCompanies);

    await listCompaniesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id);
    expect(mockRepository.getDocumentsList).toHaveBeenCalledWith(
      {
        name: [{ operator: '==', value: 'Company 1' }],
      },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(filteredCompanies);
  });

  it('should handle empty result set', async () => {
    jest.spyOn(mockRepository, 'getDocumentsList').mockResolvedValue([]);

    await listCompaniesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id);
    expect(mockRepository.getDocumentsList).toHaveBeenCalledWith(
      {},
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith([]);
  });

  it('should handle repository errors', async () => {
    const error = new Error('Repository error');
    jest.spyOn(mockRepository, 'getDocumentsList').mockRejectedValue(error);

    await expect(
      listCompaniesHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_COMPANIES.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
