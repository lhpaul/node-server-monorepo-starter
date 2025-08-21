import { STATUS_CODES } from '@repo/fastify';
import { CompaniesService } from '@repo/shared/domain';
import { maskFields } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { CREDENTIALS_FIELDS_TO_MASK } from '../../../financial-institutions.endpoints.constants';
import { listCompanyFinancialInstitutionsHandler } from '../list-company-financial-institutions.handler';
import { STEPS } from '../list-company-financial-institutions.handler.constants';


jest.mock('@repo/shared/domain');
jest.mock('@repo/shared/utils', () => ({
  maskFields: jest.fn(),
}));
jest.mock('@repo/fastify', () => ({
  STATUS_CODES: {
    OK: 200,
  },
}));

describe(listCompanyFinancialInstitutionsHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: any;
  let mockService: Partial<CompaniesService>;
  const logGroup = listCompanyFinancialInstitutionsHandler.name;
  const mockCompanyId = 'company-123';

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger,
      params: {
        companyId: mockCompanyId,
      },
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      listFinancialInstitutions: jest.fn(),
    };

    (CompaniesService.getInstance as jest.Mock).mockReturnValue(mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should list company financial institutions successfully', async () => {
    // Arrange
    const mockFinancialInstitutions = [
      {
        id: 'relation-1',
        companyId: mockCompanyId,
        credentials: { username: 'testuser', password: 'testpass', apiKey: 'secret-key' },
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        financialInstitution: {
          id: 'fi-1',
          name: 'Bank of America',
        },
      },
      {
        id: 'relation-2',
        companyId: mockCompanyId,
        credentials: { username: 'testuser2', password: 'testpass2', token: 'secret-token' },
        createdAt: new Date('2023-01-02'),
        updatedAt: new Date('2023-01-02'),
        financialInstitution: {
          id: 'fi-2',
          name: 'Chase Bank',
        },
      },
    ];

    const mockMaskedCredentials1 = { username: 'testuser', password: '***', apiKey: '***' };
    const mockMaskedCredentials2 = { username: 'testuser2', password: '***', token: '***' };

    jest.spyOn(mockService, 'listFinancialInstitutions').mockResolvedValue(mockFinancialInstitutions);
    (maskFields as jest.Mock)
      .mockReturnValueOnce(mockMaskedCredentials1)
      .mockReturnValueOnce(mockMaskedCredentials2);

    // Act
    await listCompanyFinancialInstitutionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    // Assert
    expect(mockLogger.child).toHaveBeenCalledWith({
      handler: listCompanyFinancialInstitutionsHandler.name,
    });
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_FINANCIAL_INSTITUTIONS, logGroup);
    expect(CompaniesService.getInstance).toHaveBeenCalled();
    expect(mockService.listFinancialInstitutions).toHaveBeenCalledWith(mockCompanyId, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_FINANCIAL_INSTITUTIONS);

    expect(maskFields).toHaveBeenCalledTimes(2);
    expect(maskFields).toHaveBeenNthCalledWith(1, mockFinancialInstitutions[0].credentials, CREDENTIALS_FIELDS_TO_MASK);
    expect(maskFields).toHaveBeenNthCalledWith(2, mockFinancialInstitutions[1].credentials, CREDENTIALS_FIELDS_TO_MASK);

    const expectedData = [
      {
        ...mockFinancialInstitutions[0],
        credentials: mockMaskedCredentials1,
      },
      {
        ...mockFinancialInstitutions[1],
        credentials: mockMaskedCredentials2,
      },
    ];

    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(expectedData);
  });

  it('should handle empty financial institutions list', async () => {
    // Arrange
    const mockFinancialInstitutions: any[] = [];
    jest.spyOn(mockService, 'listFinancialInstitutions').mockResolvedValue(mockFinancialInstitutions);

    // Act
    await listCompanyFinancialInstitutionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    // Assert
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_FINANCIAL_INSTITUTIONS, logGroup);
    expect(mockService.listFinancialInstitutions).toHaveBeenCalledWith(mockCompanyId, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_FINANCIAL_INSTITUTIONS);
    expect(maskFields).not.toHaveBeenCalled();
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith([]);
  });

  it('should handle service errors', async () => {
    // Arrange
    const mockError = new Error('Service error');
    jest.spyOn(mockService, 'listFinancialInstitutions').mockRejectedValue(mockError);

    // Act & Assert
    await expect(
      listCompanyFinancialInstitutionsHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(mockError);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_FINANCIAL_INSTITUTIONS, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_FINANCIAL_INSTITUTIONS);
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should handle service errors and ensure endStep is called in finally block', async () => {
    // Arrange
    const mockError = new Error('Service error');
    jest.spyOn(mockService, 'listFinancialInstitutions').mockRejectedValue(mockError);

    // Act & Assert
    await expect(
      listCompanyFinancialInstitutionsHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(mockError);

    // Verify that endStep is called even when the service throws an error
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_FINANCIAL_INSTITUTIONS);
  });

  it('should mask credentials correctly for each financial institution', async () => {
    // Arrange
    const mockFinancialInstitutions = [
      {
        id: 'relation-1',
        companyId: mockCompanyId,
        credentials: { 
          username: 'testuser', 
          password: 'testpass', 
          apiKey: 'secret-key',
          clientSecret: 'very-secret',
          token: 'access-token'
        },
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        financialInstitution: {
          id: 'fi-1',
          name: 'Bank of America',
        },
      },
    ];

    const mockMaskedCredentials = { 
      username: 'testuser', 
      password: '***', 
      apiKey: '***',
      clientSecret: '***',
      token: '***'
    };

    jest.spyOn(mockService, 'listFinancialInstitutions').mockResolvedValue(mockFinancialInstitutions);
    (maskFields as jest.Mock).mockReturnValue(mockMaskedCredentials);

    // Act
    await listCompanyFinancialInstitutionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    // Assert
    expect(maskFields).toHaveBeenCalledWith(mockFinancialInstitutions[0].credentials, CREDENTIALS_FIELDS_TO_MASK);
    expect(mockReply.send).toHaveBeenCalledWith([
      {
        ...mockFinancialInstitutions[0],
        credentials: mockMaskedCredentials,
      },
    ]);
  });

  it('should extract companyId from request params correctly', async () => {
    // Arrange
    const differentCompanyId = 'different-company-456';
    mockRequest.params = { companyId: differentCompanyId };
    
    const mockFinancialInstitutions: any[] = [];
    jest.spyOn(mockService, 'listFinancialInstitutions').mockResolvedValue(mockFinancialInstitutions);

    // Act
    await listCompanyFinancialInstitutionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    // Assert
    expect(mockService.listFinancialInstitutions).toHaveBeenCalledWith(differentCompanyId, mockLogger);
  });
}); 