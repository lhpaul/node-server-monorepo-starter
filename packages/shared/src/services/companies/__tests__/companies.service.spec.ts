// Internal modules (farthest path first, then alphabetical)
import { ExecutionLogger } from '../../../definitions';
import { CompaniesRepository, CompanyFinancialInstitutionRelationsRepository, FinancialInstitutionsRepository } from '../../../repositories';
import { decryptText, encryptText } from '../../../utils/encryption';

// Local imports (alphabetical)
import {
  ADD_FINANCIAL_INSTITUTION_ERRORS_MESSAGES,
  ADD_FINANCIAL_INSTITUTION_STEPS,
  GET_FINANCIAL_INSTITUTION_RELATION_ERRORS_MESSAGES,
  GET_FINANCIAL_INSTITUTION_RELATION_STEPS,
  LIST_FINANCIAL_INSTITUTIONS_STEPS,
  REMOVE_FINANCIAL_INSTITUTION_ERRORS_MESSAGES,
  REMOVE_FINANCIAL_INSTITUTION_STEPS,
  UPDATE_FINANCIAL_INSTITUTION_ERRORS_MESSAGES,
  UPDATE_FINANCIAL_INSTITUTION_STEPS,
} from '../companies.service.constants';
import {
  AddFinancialInstitutionError,
  AddFinancialInstitutionErrorCode,
  RemoveFinancialInstitutionError,
  RemoveFinancialInstitutionErrorCode,
  UpdateFinancialInstitutionError,
  UpdateFinancialInstitutionErrorCode,
} from '../companies.service.errors';
import {
  AddFinancialInstitutionInput,
  GetFinancialInstitutionRelationInput,
  RemoveFinancialInstitutionInput,
  UpdateCompanyFinancialInstitutionInput,
} from '../companies.service.interfaces';
import { CompaniesService } from '../companies.service';

jest.mock('../../../repositories');
jest.mock('../../../utils/encryption');

describe(CompaniesService.name, () => {
  let mockCompaniesRepository: jest.Mocked<CompaniesRepository>;
  let mockCompanyFinancialInstitutionRelationsRepository: jest.Mocked<CompanyFinancialInstitutionRelationsRepository>;
  let mockFinancialInstitutionsRepository: jest.Mocked<FinancialInstitutionsRepository>;
  let mockLogger: jest.Mocked<ExecutionLogger>;
  let companiesService: CompaniesService;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create mock repository instances
    mockCompaniesRepository = {
      // Add mock methods as needed
    } as unknown as jest.Mocked<CompaniesRepository>;

    mockCompanyFinancialInstitutionRelationsRepository = {
      createDocument: jest.fn(),
      deleteDocument: jest.fn(),
      getDocument: jest.fn(),
      getDocumentsList: jest.fn(),
      updateDocument: jest.fn(),
    } as unknown as jest.Mocked<CompanyFinancialInstitutionRelationsRepository>;

    mockFinancialInstitutionsRepository = {
      getDocument: jest.fn(),
    } as unknown as jest.Mocked<FinancialInstitutionsRepository>;

    // Create mock logger
    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
    } as unknown as jest.Mocked<ExecutionLogger>;

    // Setup the mocks to return our mock instances
    (CompaniesRepository.getInstance as jest.Mock).mockReturnValue(mockCompaniesRepository);
    (CompanyFinancialInstitutionRelationsRepository.getInstance as jest.Mock).mockReturnValue(mockCompanyFinancialInstitutionRelationsRepository);
    (FinancialInstitutionsRepository.getInstance as jest.Mock).mockReturnValue(mockFinancialInstitutionsRepository);

    // Mock the encryptText function
    (encryptText as jest.Mock).mockReturnValue('encrypted-credentials');
    
    // Mock the decryptText function
    (decryptText as jest.Mock).mockReturnValue('{"username":"testuser","password":"testpass"}');

    // Reset the singleton instance before each test
    (CompaniesService as any).instance = undefined;

    // Get the service instance
    companiesService = CompaniesService.getInstance();
  });

  describe(CompaniesService.getInstance.name, () => {
    it('should create a new instance when one does not exist', () => {
      const service = CompaniesService.getInstance();

      expect(service).toBeInstanceOf(CompaniesService);
      expect(CompaniesRepository.getInstance).toHaveBeenCalledTimes(1);
    });

    it('should return the same instance on subsequent calls', () => {
      const firstInstance = CompaniesService.getInstance();
      const secondInstance = CompaniesService.getInstance();

      expect(firstInstance).toBe(secondInstance);
      expect(CompaniesRepository.getInstance).toHaveBeenCalledTimes(1);
    });
  });

  describe(CompaniesService.prototype.addFinancialInstitution.name, () => {
    const mockCompanyId = 'company-123';
    const mockFinancialInstitutionId = 'fi-456';
    const mockCredentials = { username: 'testuser', password: 'testpass' };
    const mockInput: AddFinancialInstitutionInput = {
      financialInstitutionId: mockFinancialInstitutionId,
      credentials: mockCredentials,
    };
    const mockRelationId = 'relation-789';
    const logGroup = `${CompaniesService.name}.${CompaniesService.prototype.addFinancialInstitution.name}`;
    it('should throw AddFinancialInstitutionError when credentials cannot be stringified', async () => {
      // Arrange
      const circularObject: any = {};
      circularObject.self = circularObject;
      const invalidInput: AddFinancialInstitutionInput = {
        financialInstitutionId: mockFinancialInstitutionId,
        credentials: circularObject,
      };

      // Act & Assert
      await expect(companiesService.addFinancialInstitution(mockCompanyId, invalidInput, mockLogger))
        .rejects
        .toThrow(AddFinancialInstitutionError);

      await expect(companiesService.addFinancialInstitution(mockCompanyId, invalidInput, mockLogger))
        .rejects
        .toMatchObject({
          code: AddFinancialInstitutionErrorCode.INVALID_CREDENTIALS_FORMAT,
          message: ADD_FINANCIAL_INSTITUTION_ERRORS_MESSAGES.INVALID_CREDENTIALS_FORMAT,
        });
    });
    
    it('should throw AddFinancialInstitutionError when a relation already exists', async () => {
      // Arrange
      const existingRelation = {
        id: 'existing-relation-123',
        companyId: mockCompanyId,
        financialInstitutionId: mockFinancialInstitutionId,
        encryptedCredentials: 'existing-encrypted-credentials',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([existingRelation]);

      // Act & Assert
      await expect(companiesService.addFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow(AddFinancialInstitutionError);

      await expect(companiesService.addFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toMatchObject({
          code: AddFinancialInstitutionErrorCode.RELATION_ALREADY_EXISTS,
          message: ADD_FINANCIAL_INSTITUTION_ERRORS_MESSAGES.RELATION_ALREADY_EXISTS,
        });

      // Verify that createDocument was not called
      expect(mockCompanyFinancialInstitutionRelationsRepository.createDocument).not.toHaveBeenCalled();
      expect(encryptText).not.toHaveBeenCalled();
    });

    it('should successfully add a financial institution to a company', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([]);
      mockCompanyFinancialInstitutionRelationsRepository.createDocument.mockResolvedValue(mockRelationId);

      // Act
      const result = await companiesService.addFinancialInstitution(mockCompanyId, mockInput, mockLogger);

      // Assert
      expect(result).toBe(mockRelationId);
      expect(mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList).toHaveBeenCalledWith({
        companyId: [{ value: mockCompanyId, operator: '==' }],
        financialInstitutionId: [{ value: mockFinancialInstitutionId, operator: '==' }],
      }, mockLogger);
      expect(encryptText).toHaveBeenCalledWith(JSON.stringify(mockCredentials));
      expect(mockCompanyFinancialInstitutionRelationsRepository.createDocument).toHaveBeenCalledWith({
        companyId: mockCompanyId,
        financialInstitutionId: mockFinancialInstitutionId,
        encryptedCredentials: 'encrypted-credentials',
      }, mockLogger);
      expect(mockLogger.startStep).toHaveBeenCalledWith(ADD_FINANCIAL_INSTITUTION_STEPS.CHECK_EXISTING_RELATION, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(ADD_FINANCIAL_INSTITUTION_STEPS.CHECK_EXISTING_RELATION);
      expect(mockLogger.startStep).toHaveBeenCalledWith(ADD_FINANCIAL_INSTITUTION_STEPS.ENCRYPT_CREDENTIALS, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(ADD_FINANCIAL_INSTITUTION_STEPS.ENCRYPT_CREDENTIALS);
      expect(mockLogger.startStep).toHaveBeenCalledWith(ADD_FINANCIAL_INSTITUTION_STEPS.CREATE_RELATION, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(ADD_FINANCIAL_INSTITUTION_STEPS.CREATE_RELATION);
    });

    it('should handle empty credentials object', async () => {
      // Arrange
      const emptyCredentialsInput: AddFinancialInstitutionInput = {
        financialInstitutionId: mockFinancialInstitutionId,
        credentials: {},
      };
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([]);
      mockCompanyFinancialInstitutionRelationsRepository.createDocument.mockResolvedValue(mockRelationId);

      // Act
      const result = await companiesService.addFinancialInstitution(mockCompanyId, emptyCredentialsInput, mockLogger);

      // Assert
      expect(result).toBe(mockRelationId);
      expect(encryptText).toHaveBeenCalledWith('{}');
    });

    it('should handle null credentials', async () => {
      // Arrange
      const nullCredentialsInput: AddFinancialInstitutionInput = {
        financialInstitutionId: mockFinancialInstitutionId,
        credentials: null as any,
      };
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([]);
      mockCompanyFinancialInstitutionRelationsRepository.createDocument.mockResolvedValue(mockRelationId);

      // Act
      const result = await companiesService.addFinancialInstitution(mockCompanyId, nullCredentialsInput, mockLogger);

      // Assert
      expect(result).toBe(mockRelationId);
      expect(encryptText).toHaveBeenCalledWith('null');
    });

    it('should handle primitive credentials', async () => {
      // Arrange
      const primitiveCredentialsInput: AddFinancialInstitutionInput = {
        financialInstitutionId: mockFinancialInstitutionId,
        credentials: 'simple-string' as any,
      };
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([]);
      mockCompanyFinancialInstitutionRelationsRepository.createDocument.mockResolvedValue(mockRelationId);

      // Act
      const result = await companiesService.addFinancialInstitution(mockCompanyId, primitiveCredentialsInput, mockLogger);

      // Assert
      expect(result).toBe(mockRelationId);
      expect(encryptText).toHaveBeenCalledWith('"simple-string"');
    });

    it('should ensure logger.endStep is called even if createDocument throws an error', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([]);
      const repositoryError = new Error('Repository error');
      mockCompanyFinancialInstitutionRelationsRepository.createDocument.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(companiesService.addFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow(repositoryError);

      // Verify that endStep was still called for the CREATE_RELATION step
      expect(mockLogger.endStep).toHaveBeenCalledWith(ADD_FINANCIAL_INSTITUTION_STEPS.CREATE_RELATION);
    });

    it('should ensure logger.endStep is called even if getDocumentsList throws an error', async () => {
      // Arrange
      const repositoryError = new Error('Repository error');
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(companiesService.addFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow(repositoryError);

      // Verify that endStep was still called for the CHECK_EXISTING_RELATION step
      expect(mockLogger.endStep).toHaveBeenCalledWith(ADD_FINANCIAL_INSTITUTION_STEPS.CHECK_EXISTING_RELATION);
    });

    it('should call logger methods in the correct order', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([]);
      mockCompanyFinancialInstitutionRelationsRepository.createDocument.mockResolvedValue(mockRelationId);

      // Act
      await companiesService.addFinancialInstitution(mockCompanyId, mockInput, mockLogger);

      // Assert
      expect(mockLogger.startStep).toHaveBeenNthCalledWith(1, ADD_FINANCIAL_INSTITUTION_STEPS.CHECK_EXISTING_RELATION, logGroup);
      expect(mockLogger.endStep).toHaveBeenNthCalledWith(1, ADD_FINANCIAL_INSTITUTION_STEPS.CHECK_EXISTING_RELATION);
      expect(mockLogger.startStep).toHaveBeenNthCalledWith(2, ADD_FINANCIAL_INSTITUTION_STEPS.ENCRYPT_CREDENTIALS, logGroup);
      expect(mockLogger.endStep).toHaveBeenNthCalledWith(2, ADD_FINANCIAL_INSTITUTION_STEPS.ENCRYPT_CREDENTIALS);
      expect(mockLogger.startStep).toHaveBeenNthCalledWith(3, ADD_FINANCIAL_INSTITUTION_STEPS.CREATE_RELATION, logGroup);
      expect(mockLogger.endStep).toHaveBeenNthCalledWith(3, ADD_FINANCIAL_INSTITUTION_STEPS.CREATE_RELATION);
    });
  });

  describe(CompaniesService.prototype.updateFinancialInstitution.name, () => {
    const mockCompanyId = 'company-123';
    const mockFinancialInstitutionRelationId = 'relation-789';
    const mockCredentials = { username: 'newuser', password: 'newpass', apiKey: 'new-api-key' };
    const mockInput: UpdateCompanyFinancialInstitutionInput = {
      financialInstitutionRelationId: mockFinancialInstitutionRelationId,
      credentials: mockCredentials,
    };
    const mockRelation = {
      id: mockFinancialInstitutionRelationId,
      companyId: mockCompanyId,
      financialInstitutionId: 'fi-456',
      encryptedCredentials: 'old-encrypted-credentials',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const logGroup = `${CompaniesService.name}.${CompaniesService.prototype.updateFinancialInstitution.name}`;

    it('should throw UpdateFinancialInstitutionError when credentials cannot be stringified', async () => {
      // Arrange
      const circularObject: any = {};
      circularObject.self = circularObject;
      const invalidInput: UpdateCompanyFinancialInstitutionInput = {
        financialInstitutionRelationId: mockFinancialInstitutionRelationId,
        credentials: circularObject,
      };

      // Act & Assert
      await expect(companiesService.updateFinancialInstitution(mockCompanyId, invalidInput, mockLogger))
        .rejects
        .toThrow(UpdateFinancialInstitutionError);

      await expect(companiesService.updateFinancialInstitution(mockCompanyId, invalidInput, mockLogger))
        .rejects
        .toMatchObject({
          code: UpdateFinancialInstitutionErrorCode.INVALID_CREDENTIALS_FORMAT,
          message: UPDATE_FINANCIAL_INSTITUTION_ERRORS_MESSAGES.INVALID_CREDENTIALS_FORMAT,
        });
    });

    it('should throw UpdateFinancialInstitutionError when relation is not found', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(null);

      // Act & Assert
      await expect(companiesService.updateFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow(UpdateFinancialInstitutionError);

      await expect(companiesService.updateFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toMatchObject({
          code: UpdateFinancialInstitutionErrorCode.RELATION_NOT_FOUND,
          message: UPDATE_FINANCIAL_INSTITUTION_ERRORS_MESSAGES.RELATION_NOT_FOUND,
        });

      // Verify that updateDocument was not called
      expect(mockCompanyFinancialInstitutionRelationsRepository.updateDocument).not.toHaveBeenCalled();
      expect(encryptText).not.toHaveBeenCalled();
    });

    it('should throw UpdateFinancialInstitutionError when relation belongs to different company', async () => {
      // Arrange
      const differentCompanyRelation = {
        ...mockRelation,
        companyId: 'different-company-id',
      };
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(differentCompanyRelation);

      // Act & Assert
      await expect(companiesService.updateFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow(UpdateFinancialInstitutionError);

      await expect(companiesService.updateFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toMatchObject({
          code: UpdateFinancialInstitutionErrorCode.RELATION_NOT_FOUND,
          message: UPDATE_FINANCIAL_INSTITUTION_ERRORS_MESSAGES.RELATION_NOT_FOUND,
        });

      // Verify that updateDocument was not called
      expect(mockCompanyFinancialInstitutionRelationsRepository.updateDocument).not.toHaveBeenCalled();
      expect(encryptText).not.toHaveBeenCalled();
    });

    it('should successfully update a financial institution relation for a company', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(mockRelation);
      mockCompanyFinancialInstitutionRelationsRepository.updateDocument.mockResolvedValue();

      // Act
      await companiesService.updateFinancialInstitution(mockCompanyId, mockInput, mockLogger);

      // Assert
      expect(mockCompanyFinancialInstitutionRelationsRepository.getDocument).toHaveBeenCalledWith(mockFinancialInstitutionRelationId, mockLogger);
      expect(encryptText).toHaveBeenCalledWith(JSON.stringify(mockCredentials));
      expect(mockCompanyFinancialInstitutionRelationsRepository.updateDocument).toHaveBeenCalledWith(mockFinancialInstitutionRelationId, {
        encryptedCredentials: 'encrypted-credentials',
      }, mockLogger);
      expect(mockLogger.startStep).toHaveBeenCalledWith(UPDATE_FINANCIAL_INSTITUTION_STEPS.GET_RELATION, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(UPDATE_FINANCIAL_INSTITUTION_STEPS.GET_RELATION);
      expect(mockLogger.startStep).toHaveBeenCalledWith(UPDATE_FINANCIAL_INSTITUTION_STEPS.UPDATE_RELATION, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(UPDATE_FINANCIAL_INSTITUTION_STEPS.UPDATE_RELATION);
    });

    it('should handle empty credentials object', async () => {
      // Arrange
      const emptyCredentialsInput: UpdateCompanyFinancialInstitutionInput = {
        financialInstitutionRelationId: mockFinancialInstitutionRelationId,
        credentials: {},
      };
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(mockRelation);
      mockCompanyFinancialInstitutionRelationsRepository.updateDocument.mockResolvedValue();

      // Act
      await companiesService.updateFinancialInstitution(mockCompanyId, emptyCredentialsInput, mockLogger);

      // Assert
      expect(encryptText).toHaveBeenCalledWith('{}');
      expect(mockCompanyFinancialInstitutionRelationsRepository.updateDocument).toHaveBeenCalledWith(mockFinancialInstitutionRelationId, {
        encryptedCredentials: 'encrypted-credentials',
      }, mockLogger);
    });

    it('should handle null credentials', async () => {
      // Arrange
      const nullCredentialsInput: UpdateCompanyFinancialInstitutionInput = {
        financialInstitutionRelationId: mockFinancialInstitutionRelationId,
        credentials: null as any,
      };
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(mockRelation);
      mockCompanyFinancialInstitutionRelationsRepository.updateDocument.mockResolvedValue();

      // Act
      await companiesService.updateFinancialInstitution(mockCompanyId, nullCredentialsInput, mockLogger);

      // Assert
      expect(encryptText).toHaveBeenCalledWith('null');
      expect(mockCompanyFinancialInstitutionRelationsRepository.updateDocument).toHaveBeenCalledWith(mockFinancialInstitutionRelationId, {
        encryptedCredentials: 'encrypted-credentials',
      }, mockLogger);
    });

    it('should handle primitive credentials', async () => {
      // Arrange
      const primitiveCredentialsInput: UpdateCompanyFinancialInstitutionInput = {
        financialInstitutionRelationId: mockFinancialInstitutionRelationId,
        credentials: 'simple-string' as any,
      };
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(mockRelation);
      mockCompanyFinancialInstitutionRelationsRepository.updateDocument.mockResolvedValue();

      // Act
      await companiesService.updateFinancialInstitution(mockCompanyId, primitiveCredentialsInput, mockLogger);

      // Assert
      expect(encryptText).toHaveBeenCalledWith('"simple-string"');
      expect(mockCompanyFinancialInstitutionRelationsRepository.updateDocument).toHaveBeenCalledWith(mockFinancialInstitutionRelationId, {
        encryptedCredentials: 'encrypted-credentials',
      }, mockLogger);
    });

    it('should ensure logger.endStep is called even if updateDocument throws an error', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(mockRelation);
      const repositoryError = new Error('Repository error');
      mockCompanyFinancialInstitutionRelationsRepository.updateDocument.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(companiesService.updateFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow(repositoryError);

      // Verify that endStep was still called for the UPDATE_RELATION step
      expect(mockLogger.endStep).toHaveBeenCalledWith(UPDATE_FINANCIAL_INSTITUTION_STEPS.UPDATE_RELATION);
    });

    it('should ensure logger.endStep is called even if getDocument throws an error', async () => {
      // Arrange
      const repositoryError = new Error('Repository error');
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(companiesService.updateFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow(repositoryError);

      // Verify that endStep was still called for the GET_RELATION step
      expect(mockLogger.endStep).toHaveBeenCalledWith(UPDATE_FINANCIAL_INSTITUTION_STEPS.GET_RELATION);
    });

    it('should call logger methods in the correct order', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(mockRelation);
      mockCompanyFinancialInstitutionRelationsRepository.updateDocument.mockResolvedValue();

      // Act
      await companiesService.updateFinancialInstitution(mockCompanyId, mockInput, mockLogger);

      // Assert
      expect(mockLogger.startStep).toHaveBeenNthCalledWith(1, UPDATE_FINANCIAL_INSTITUTION_STEPS.GET_RELATION, logGroup);
      expect(mockLogger.endStep).toHaveBeenNthCalledWith(1, UPDATE_FINANCIAL_INSTITUTION_STEPS.GET_RELATION);
      expect(mockLogger.startStep).toHaveBeenNthCalledWith(2, UPDATE_FINANCIAL_INSTITUTION_STEPS.UPDATE_RELATION, logGroup);
      expect(mockLogger.endStep).toHaveBeenNthCalledWith(2, UPDATE_FINANCIAL_INSTITUTION_STEPS.UPDATE_RELATION);
    });

    it('should handle repository getDocument errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(companiesService.updateFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow('Database connection failed');

      // Verify that updateDocument was not called
      expect(mockCompanyFinancialInstitutionRelationsRepository.updateDocument).not.toHaveBeenCalled();
      expect(encryptText).not.toHaveBeenCalled();
    });

    it('should handle repository updateDocument errors gracefully', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(mockRelation);
      const repositoryError = new Error('Update operation failed');
      mockCompanyFinancialInstitutionRelationsRepository.updateDocument.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(companiesService.updateFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow('Update operation failed');
    });

    it('should handle complex nested credentials object', async () => {
      // Arrange
      const complexCredentials = {
        authentication: {
          username: 'complex-user',
          password: 'complex-pass',
          twoFactor: {
            enabled: true,
            secret: 'secret-key',
          },
        },
        api: {
          key: 'api-key-123',
          version: 'v2',
          endpoints: ['/auth', '/data', '/sync'],
        },
        settings: {
          timeout: 30000,
          retries: 3,
          ssl: true,
        },
      };
      const complexInput: UpdateCompanyFinancialInstitutionInput = {
        financialInstitutionRelationId: mockFinancialInstitutionRelationId,
        credentials: complexCredentials,
      };
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(mockRelation);
      mockCompanyFinancialInstitutionRelationsRepository.updateDocument.mockResolvedValue();

      // Act
      await companiesService.updateFinancialInstitution(mockCompanyId, complexInput, mockLogger);

      // Assert
      expect(encryptText).toHaveBeenCalledWith(JSON.stringify(complexCredentials));
      expect(mockCompanyFinancialInstitutionRelationsRepository.updateDocument).toHaveBeenCalledWith(mockFinancialInstitutionRelationId, {
        encryptedCredentials: 'encrypted-credentials',
      }, mockLogger);
    });

    it('should handle credentials with special characters and unicode', async () => {
      // Arrange
      const specialCredentials = {
        username: 'user@domain.com',
        password: 'p@ssw0rd!@#$%^&*()',
        apiKey: 'key-with-unicode-🚀-🎉-🔥',
        notes: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
      };
      const specialInput: UpdateCompanyFinancialInstitutionInput = {
        financialInstitutionRelationId: mockFinancialInstitutionRelationId,
        credentials: specialCredentials,
      };
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(mockRelation);
      mockCompanyFinancialInstitutionRelationsRepository.updateDocument.mockResolvedValue();

      // Act
      await companiesService.updateFinancialInstitution(mockCompanyId, specialInput, mockLogger);

      // Assert
      expect(encryptText).toHaveBeenCalledWith(JSON.stringify(specialCredentials));
      expect(mockCompanyFinancialInstitutionRelationsRepository.updateDocument).toHaveBeenCalledWith(mockFinancialInstitutionRelationId, {
        encryptedCredentials: 'encrypted-credentials',
      }, mockLogger);
    });
  });

  describe(CompaniesService.prototype.removeFinancialInstitution.name, () => {
    const mockCompanyId = 'company-123';
    const mockFinancialInstitutionRelationId = 'relation-789';
    const mockInput: RemoveFinancialInstitutionInput = {
      financialInstitutionRelationId: mockFinancialInstitutionRelationId,
    };
    const mockRelation = {
      id: mockFinancialInstitutionRelationId,
      companyId: mockCompanyId,
      financialInstitutionId: 'fi-456',
      encryptedCredentials: 'encrypted-credentials',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const logGroup = `${CompaniesService.name}.${CompaniesService.prototype.removeFinancialInstitution.name}`;

    it('should successfully remove a financial institution from a company', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(mockRelation);
      mockCompanyFinancialInstitutionRelationsRepository.deleteDocument.mockResolvedValue();

      // Act
      await companiesService.removeFinancialInstitution(mockCompanyId, mockInput, mockLogger);

      // Assert
      expect(mockCompanyFinancialInstitutionRelationsRepository.getDocument).toHaveBeenCalledWith(mockFinancialInstitutionRelationId, mockLogger);
      expect(mockCompanyFinancialInstitutionRelationsRepository.deleteDocument).toHaveBeenCalledWith(mockFinancialInstitutionRelationId, mockLogger);
      expect(mockLogger.startStep).toHaveBeenCalledWith(REMOVE_FINANCIAL_INSTITUTION_STEPS.GET_RELATION, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(REMOVE_FINANCIAL_INSTITUTION_STEPS.GET_RELATION);
      expect(mockLogger.startStep).toHaveBeenCalledWith(REMOVE_FINANCIAL_INSTITUTION_STEPS.DELETE_RELATION, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(REMOVE_FINANCIAL_INSTITUTION_STEPS.DELETE_RELATION);
    });

    it('should throw RemoveFinancialInstitutionError when relation is not found', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(null);

      // Act & Assert
      await expect(companiesService.removeFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow(RemoveFinancialInstitutionError);

      await expect(companiesService.removeFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toMatchObject({
          code: RemoveFinancialInstitutionErrorCode.RELATION_NOT_FOUND,
          message: REMOVE_FINANCIAL_INSTITUTION_ERRORS_MESSAGES.RELATION_NOT_FOUND,
        });

      // Verify that deleteDocument was not called
      expect(mockCompanyFinancialInstitutionRelationsRepository.deleteDocument).not.toHaveBeenCalled();
    });

    it('should throw RemoveFinancialInstitutionError when relation belongs to different company', async () => {
      // Arrange
      const differentCompanyRelation = {
        ...mockRelation,
        companyId: 'different-company-id',
      };
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(differentCompanyRelation);

      // Act & Assert
      await expect(companiesService.removeFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow(RemoveFinancialInstitutionError);

      await expect(companiesService.removeFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toMatchObject({
          code: RemoveFinancialInstitutionErrorCode.RELATION_NOT_FOUND,
          message: REMOVE_FINANCIAL_INSTITUTION_ERRORS_MESSAGES.RELATION_NOT_FOUND,
        });

      // Verify that deleteDocument was not called
      expect(mockCompanyFinancialInstitutionRelationsRepository.deleteDocument).not.toHaveBeenCalled();
    });

    it('should call logger methods in the correct order', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(mockRelation);
      mockCompanyFinancialInstitutionRelationsRepository.deleteDocument.mockResolvedValue();

      // Act
      await companiesService.removeFinancialInstitution(mockCompanyId, mockInput, mockLogger);

      // Assert
      expect(mockLogger.startStep).toHaveBeenNthCalledWith(1, REMOVE_FINANCIAL_INSTITUTION_STEPS.GET_RELATION, logGroup);
      expect(mockLogger.endStep).toHaveBeenNthCalledWith(1, REMOVE_FINANCIAL_INSTITUTION_STEPS.GET_RELATION);
      expect(mockLogger.startStep).toHaveBeenNthCalledWith(2, REMOVE_FINANCIAL_INSTITUTION_STEPS.DELETE_RELATION, logGroup);
      expect(mockLogger.endStep).toHaveBeenNthCalledWith(2, REMOVE_FINANCIAL_INSTITUTION_STEPS.DELETE_RELATION);
    });
    
    it('should ensure logger.endStep is called even if getDocument throws an error', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockRejectedValue(new Error('Repository error'));

      // Act & Assert
      await expect(companiesService.removeFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow('Repository error');

      // Verify that endStep was still called for the GET_RELATION step
      expect(mockLogger.endStep).toHaveBeenCalledWith(REMOVE_FINANCIAL_INSTITUTION_STEPS.GET_RELATION);
    });

    it('should ensure logger.endStep is called even if deleteDocument throws an error', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(mockRelation);
      const repositoryError = new Error('Repository error');
      mockCompanyFinancialInstitutionRelationsRepository.deleteDocument.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(companiesService.removeFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow(repositoryError);

      // Verify that endStep was still called for the DELETE_RELATION step
      expect(mockLogger.endStep).toHaveBeenCalledWith(REMOVE_FINANCIAL_INSTITUTION_STEPS.DELETE_RELATION);
    });
  });

  describe(CompaniesService.prototype.listFinancialInstitutions.name, () => {
    const mockCompanyId = 'company-123';
    const logGroup = `${CompaniesService.name}.${CompaniesService.prototype.listFinancialInstitutions.name}`;

    const mockFinancialInstitution1 = {
      id: 'fi-1',
      name: 'Bank of America',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    };

    const mockFinancialInstitution2 = {
      id: 'fi-2',
      name: 'Chase Bank',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    };

    const mockFinancialInstitution3 = {
      id: 'fi-3',
      name: 'Wells Fargo',
      createdAt: new Date('2023-01-03'),
      updatedAt: new Date('2023-01-03'),
    };

    const mockRelations = [
      {
        id: 'relation-1',
        companyId: mockCompanyId,
        financialInstitutionId: 'fi-1',
        encryptedCredentials: 'encrypted-credentials-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'relation-2',
        companyId: mockCompanyId,
        financialInstitutionId: 'fi-2',
        encryptedCredentials: 'encrypted-credentials-2',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'relation-3',
        companyId: mockCompanyId,
        financialInstitutionId: 'fi-3',
        encryptedCredentials: 'encrypted-credentials-3',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return empty array when no financial institutions are related to the company', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([]);

      // Act
      const result = await companiesService.listFinancialInstitutions(mockCompanyId, mockLogger);

      // Assert
      expect(result).toEqual([]);
      expect(mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList).toHaveBeenCalledWith({
        companyId: [{ value: mockCompanyId, operator: '==' }],
      }, mockLogger);
      expect(mockFinancialInstitutionsRepository.getDocument).not.toHaveBeenCalled();
      expect(mockLogger.startStep).toHaveBeenCalledWith(LIST_FINANCIAL_INSTITUTIONS_STEPS.GET_RELATIONS, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(LIST_FINANCIAL_INSTITUTIONS_STEPS.GET_RELATIONS);
      // When no relations exist, the second step should not be called
      expect(mockLogger.startStep).not.toHaveBeenCalledWith(LIST_FINANCIAL_INSTITUTIONS_STEPS.GET_FINANCIAL_INSTITUTIONS, logGroup);
      expect(mockLogger.endStep).not.toHaveBeenCalledWith(LIST_FINANCIAL_INSTITUTIONS_STEPS.GET_FINANCIAL_INSTITUTIONS);
    });

    it('should return all financial institutions related to the company', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue(mockRelations);
      mockFinancialInstitutionsRepository.getDocument
        .mockResolvedValueOnce(mockFinancialInstitution1)
        .mockResolvedValueOnce(mockFinancialInstitution2)
        .mockResolvedValueOnce(mockFinancialInstitution3);

      // Act
      const result = await companiesService.listFinancialInstitutions(mockCompanyId, mockLogger);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({
        id: 'relation-1',
        companyId: mockCompanyId,
        credentials: { username: 'testuser', password: 'testpass' },
        createdAt: mockRelations[0].createdAt,
        updatedAt: mockRelations[0].updatedAt,
        financialInstitution: {
          id: 'fi-1',
          name: 'Bank of America',
        },
      });
      expect(result[1]).toMatchObject({
        id: 'relation-2',
        companyId: mockCompanyId,
        credentials: { username: 'testuser', password: 'testpass' },
        createdAt: mockRelations[1].createdAt,
        updatedAt: mockRelations[1].updatedAt,
        financialInstitution: {
          id: 'fi-2',
          name: 'Chase Bank',
        },
      });
      expect(result[2]).toMatchObject({
        id: 'relation-3',
        companyId: mockCompanyId,
        credentials: { username: 'testuser', password: 'testpass' },
        createdAt: mockRelations[2].createdAt,
        updatedAt: mockRelations[2].updatedAt,
        financialInstitution: {
          id: 'fi-3',
          name: 'Wells Fargo',
        },
      });

      expect(mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList).toHaveBeenCalledWith({
        companyId: [{ value: mockCompanyId, operator: '==' }],
      }, mockLogger);

      expect(mockFinancialInstitutionsRepository.getDocument).toHaveBeenCalledWith('fi-1', mockLogger);
      expect(mockFinancialInstitutionsRepository.getDocument).toHaveBeenCalledWith('fi-2', mockLogger);
      expect(mockFinancialInstitutionsRepository.getDocument).toHaveBeenCalledWith('fi-3', mockLogger);
      expect(mockFinancialInstitutionsRepository.getDocument).toHaveBeenCalledTimes(3);

      expect(mockLogger.startStep).toHaveBeenCalledWith(LIST_FINANCIAL_INSTITUTIONS_STEPS.GET_RELATIONS, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(LIST_FINANCIAL_INSTITUTIONS_STEPS.GET_RELATIONS);
      expect(mockLogger.startStep).toHaveBeenCalledWith(LIST_FINANCIAL_INSTITUTIONS_STEPS.GET_FINANCIAL_INSTITUTIONS, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(LIST_FINANCIAL_INSTITUTIONS_STEPS.GET_FINANCIAL_INSTITUTIONS);
    });

    it('should handle missing financial institutions gracefully', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue(mockRelations);
      mockFinancialInstitutionsRepository.getDocument
        .mockResolvedValueOnce(mockFinancialInstitution1)
        .mockResolvedValueOnce(null) // Missing financial institution
        .mockResolvedValueOnce(mockFinancialInstitution3);

      // Act
      const result = await companiesService.listFinancialInstitutions(mockCompanyId, mockLogger);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'relation-1',
        companyId: mockCompanyId,
        credentials: { username: 'testuser', password: 'testpass' },
        createdAt: mockRelations[0].createdAt,
        updatedAt: mockRelations[0].updatedAt,
        financialInstitution: {
          id: 'fi-1',
          name: 'Bank of America',
        },
      });
      expect(result[1]).toMatchObject({
        id: 'relation-3',
        companyId: mockCompanyId,
        credentials: { username: 'testuser', password: 'testpass' },
        createdAt: mockRelations[2].createdAt,
        updatedAt: mockRelations[2].updatedAt,
        financialInstitution: {
          id: 'fi-3',
          name: 'Wells Fargo',
        },
      });

      expect(mockFinancialInstitutionsRepository.getDocument).toHaveBeenCalledWith('fi-1', mockLogger);
      expect(mockFinancialInstitutionsRepository.getDocument).toHaveBeenCalledWith('fi-2', mockLogger);
      expect(mockFinancialInstitutionsRepository.getDocument).toHaveBeenCalledWith('fi-3', mockLogger);
      expect(mockFinancialInstitutionsRepository.getDocument).toHaveBeenCalledTimes(3);
    });

    it('should handle single financial institution relation', async () => {
      // Arrange
      const singleRelation = [mockRelations[0]];
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue(singleRelation);
      mockFinancialInstitutionsRepository.getDocument.mockResolvedValueOnce(mockFinancialInstitution1);

      // Act
      const result = await companiesService.listFinancialInstitutions(mockCompanyId, mockLogger);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'relation-1',
        companyId: mockCompanyId,
        credentials: { username: 'testuser', password: 'testpass' },
        createdAt: mockRelations[0].createdAt,
        updatedAt: mockRelations[0].updatedAt,
        financialInstitution: {
          id: 'fi-1',
          name: 'Bank of America',
        },
      });

      expect(mockFinancialInstitutionsRepository.getDocument).toHaveBeenCalledWith('fi-1', mockLogger);
      expect(mockFinancialInstitutionsRepository.getDocument).toHaveBeenCalledTimes(1);
    });

    it('should call logger methods in the correct order', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue(mockRelations);
      mockFinancialInstitutionsRepository.getDocument
        .mockResolvedValueOnce(mockFinancialInstitution1)
        .mockResolvedValueOnce(mockFinancialInstitution2)
        .mockResolvedValueOnce(mockFinancialInstitution3);

      // Act
      await companiesService.listFinancialInstitutions(mockCompanyId, mockLogger);

      // Assert
      expect(mockLogger.startStep).toHaveBeenNthCalledWith(1, LIST_FINANCIAL_INSTITUTIONS_STEPS.GET_RELATIONS, logGroup);
      expect(mockLogger.endStep).toHaveBeenNthCalledWith(1, LIST_FINANCIAL_INSTITUTIONS_STEPS.GET_RELATIONS);
      expect(mockLogger.startStep).toHaveBeenNthCalledWith(2, LIST_FINANCIAL_INSTITUTIONS_STEPS.GET_FINANCIAL_INSTITUTIONS, logGroup);
      expect(mockLogger.endStep).toHaveBeenNthCalledWith(2, LIST_FINANCIAL_INSTITUTIONS_STEPS.GET_FINANCIAL_INSTITUTIONS);
    });

    it('should ensure logger.endStep is called even if getDocumentsList throws an error', async () => {
      // Arrange
      const repositoryError = new Error('Repository error');
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(companiesService.listFinancialInstitutions(mockCompanyId, mockLogger))
        .rejects
        .toThrow(repositoryError);

      // Verify that endStep was still called for the GET_RELATIONS step
      expect(mockLogger.endStep).toHaveBeenCalledWith(LIST_FINANCIAL_INSTITUTIONS_STEPS.GET_RELATIONS);
    });

    it('should ensure logger.endStep is called even if getDocument throws an error', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue(mockRelations);
      const repositoryError = new Error('Repository error');
      mockFinancialInstitutionsRepository.getDocument.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(companiesService.listFinancialInstitutions(mockCompanyId, mockLogger))
        .rejects
        .toThrow(repositoryError);

      // Verify that endStep was still called for the GET_FINANCIAL_INSTITUTIONS step
      expect(mockLogger.endStep).toHaveBeenCalledWith(LIST_FINANCIAL_INSTITUTIONS_STEPS.GET_FINANCIAL_INSTITUTIONS);
    });

    it('should handle repository getDocumentsList errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(companiesService.listFinancialInstitutions(mockCompanyId, mockLogger))
        .rejects
        .toThrow('Database connection failed');

      // Verify that getDocument was not called
      expect(mockFinancialInstitutionsRepository.getDocument).not.toHaveBeenCalled();
    });

    it('should handle repository getDocument errors gracefully', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue(mockRelations);
      const repositoryError = new Error('Financial institution not found');
      mockFinancialInstitutionsRepository.getDocument.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(companiesService.listFinancialInstitutions(mockCompanyId, mockLogger))
        .rejects
        .toThrow('Financial institution not found');
    });

    it('should handle all financial institutions being missing', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue(mockRelations);
      mockFinancialInstitutionsRepository.getDocument
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      // Act
      const result = await companiesService.listFinancialInstitutions(mockCompanyId, mockLogger);

      // Assert
      expect(result).toHaveLength(0);
      expect(mockFinancialInstitutionsRepository.getDocument).toHaveBeenCalledTimes(3);
    });

    it('should handle empty decrypted credentials string', async () => {
      // Arrange
      const singleRelation = [mockRelations[0]];
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue(singleRelation);
      mockFinancialInstitutionsRepository.getDocument.mockResolvedValueOnce(mockFinancialInstitution1);

      (decryptText as jest.Mock).mockReturnValue('');

      // Act & Assert
      await expect(companiesService.listFinancialInstitutions(mockCompanyId, mockLogger))
        .rejects
        .toThrow('Unexpected end of JSON input');

      // Verify that endStep was still called for the GET_FINANCIAL_INSTITUTIONS step
      expect(mockLogger.endStep).toHaveBeenCalledWith(LIST_FINANCIAL_INSTITUTIONS_STEPS.GET_FINANCIAL_INSTITUTIONS);
    });
    it('should handle different credential formats correctly', async () => {
      // Arrange
      const relationsWithDifferentCredentials = [
        {
          id: 'relation-1',
          companyId: mockCompanyId,
          financialInstitutionId: 'fi-1',
          encryptedCredentials: 'encrypted-object',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'relation-2',
          companyId: mockCompanyId,
          financialInstitutionId: 'fi-2',
          encryptedCredentials: 'encrypted-array',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'relation-3',
          companyId: mockCompanyId,
          financialInstitutionId: 'fi-3',
          encryptedCredentials: 'encrypted-primitive',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue(relationsWithDifferentCredentials);
      mockFinancialInstitutionsRepository.getDocument
        .mockResolvedValueOnce(mockFinancialInstitution1)
        .mockResolvedValueOnce(mockFinancialInstitution2)
        .mockResolvedValueOnce(mockFinancialInstitution3);

      (decryptText as jest.Mock).mockImplementation((encryptedCredentials) => {
        switch (encryptedCredentials) {
          case 'encrypted-object':
            return '{"username":"user1","password":"pass1"}';
          case 'encrypted-array':
            return '["item1","item2","item3"]';
          case 'encrypted-primitive':
            return '"simple-string"';
          default:
            return '{}';
        }
      });

      // Act
      const result = await companiesService.listFinancialInstitutions(mockCompanyId, mockLogger);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].credentials).toEqual({ username: 'user1', password: 'pass1' });
      expect(result[1].credentials).toEqual(['item1', 'item2', 'item3']);
      expect(result[2].credentials).toBe('simple-string');
    });
    it('should handle complex nested credential objects', async () => {
      // Arrange
      const singleRelation = [mockRelations[0]];
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue(singleRelation);
      mockFinancialInstitutionsRepository.getDocument.mockResolvedValueOnce(mockFinancialInstitution1);

      const complexCredentials = {
        authentication: {
          username: 'complex-user',
          password: 'complex-pass',
          twoFactor: {
            enabled: true,
            secret: 'secret-key',
          },
        },
        api: {
          key: 'api-key-123',
          version: 'v2',
          endpoints: ['/auth', '/data', '/sync'],
        },
        settings: {
          timeout: 30000,
          retries: 3,
          ssl: true,
        },
      };

      (decryptText as jest.Mock).mockReturnValue(JSON.stringify(complexCredentials));

      // Act
      const result = await companiesService.listFinancialInstitutions(mockCompanyId, mockLogger);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].credentials).toEqual(complexCredentials);
      expect(result[0].credentials.authentication.twoFactor.enabled).toBe(true);
      expect(result[0].credentials.api.endpoints).toContain('/auth');
      expect(result[0].credentials.settings.timeout).toBe(30000);
    });

    it('should handle credentials with special characters and unicode', async () => {
      // Arrange
      const singleRelation = [mockRelations[0]];
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue(singleRelation);
      mockFinancialInstitutionsRepository.getDocument.mockResolvedValueOnce(mockFinancialInstitution1);

      const specialCredentials = {
        username: 'user@domain.com',
        password: 'p@ssw0rd!@#$%^&*()',
        apiKey: 'key-with-unicode-🚀-🎉-🔥',
        notes: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
      };

      (decryptText as jest.Mock).mockReturnValue(JSON.stringify(specialCredentials));

      // Act
      const result = await companiesService.listFinancialInstitutions(mockCompanyId, mockLogger);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].credentials).toEqual(specialCredentials);
      expect(result[0].credentials.username).toBe('user@domain.com');
      expect(result[0].credentials.apiKey).toBe('key-with-unicode-🚀-🎉-🔥');
      expect(result[0].credentials.notes).toBe('Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?');
    });

    it('should verify exact object structure of returned items', async () => {
      // Arrange
      const singleRelation = [mockRelations[0]];
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue(singleRelation);
      mockFinancialInstitutionsRepository.getDocument.mockResolvedValueOnce(mockFinancialInstitution1);

      // Act
      const result = await companiesService.listFinancialInstitutions(mockCompanyId, mockLogger);

      // Assert
      expect(result).toHaveLength(1);
      const item = result[0];
      
      // Verify all required properties exist
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('companyId');
      expect(item).toHaveProperty('credentials');
      expect(item).toHaveProperty('createdAt');
      expect(item).toHaveProperty('updatedAt');
      expect(item).toHaveProperty('financialInstitution');
      expect(item.financialInstitution).toHaveProperty('id');
      expect(item.financialInstitution).toHaveProperty('name');

      // Verify property types
      expect(typeof item.id).toBe('string');
      expect(typeof item.companyId).toBe('string');
      expect(typeof item.credentials).toBe('object');
      expect(item.createdAt).toBeInstanceOf(Date);
      expect(item.updatedAt).toBeInstanceOf(Date);
      expect(typeof item.financialInstitution.id).toBe('string');
      expect(typeof item.financialInstitution.name).toBe('string');

      // Verify exact values
      expect(item.id).toBe('relation-1');
      expect(item.companyId).toBe(mockCompanyId);
      expect(item.credentials).toEqual({ username: 'testuser', password: 'testpass' });
      expect(item.financialInstitution.id).toBe('fi-1');
      expect(item.financialInstitution.name).toBe('Bank of America');
    });

    it('should handle large number of relations efficiently', async () => {
      // Arrange
      const largeNumberOfRelations = Array.from({ length: 100 }, (_, index) => ({
        id: `relation-${index + 1}`,
        companyId: mockCompanyId,
        financialInstitutionId: `fi-${index + 1}`,
        encryptedCredentials: `encrypted-credentials-${index + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const largeNumberOfFinancialInstitutions = Array.from({ length: 100 }, (_, index) => ({
        id: `fi-${index + 1}`,
        name: `Bank ${index + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue(largeNumberOfRelations);
      
      // Mock getDocument to return financial institutions sequentially
      mockFinancialInstitutionsRepository.getDocument.mockImplementation((id) => {
        const index = parseInt(id.split('-')[1]) - 1;
        return Promise.resolve(largeNumberOfFinancialInstitutions[index]);
      });

      // Act
      const result = await companiesService.listFinancialInstitutions(mockCompanyId, mockLogger);

      // Assert
      expect(result).toHaveLength(100);
      expect(mockFinancialInstitutionsRepository.getDocument).toHaveBeenCalledTimes(100);
      
      // Verify first and last items
      expect(result[0].id).toBe('relation-1');
      expect(result[0].financialInstitution.name).toBe('Bank 1');
      expect(result[99].id).toBe('relation-100');
      expect(result[99].financialInstitution.name).toBe('Bank 100');
    });
  });

  describe(CompaniesService.prototype.getFinancialInstitution.name, () => {
    const mockCompanyId = 'company-1';
    const mockFinancialInstitutionId = 'fi-1';
    const mockRelationId = 'relation-1';
    const mockCredentials = { username: 'testuser', password: 'testpass' };
    const mockEncryptedCredentials = 'encrypted-credentials-string';
    const mockDecryptedCredentialsString = JSON.stringify(mockCredentials);
    const logGroup = `${CompaniesService.name}.${CompaniesService.prototype.getFinancialInstitution.name}`;

    const mockRelation = {
      id: mockRelationId,
      companyId: mockCompanyId,
      financialInstitutionId: mockFinancialInstitutionId,
      encryptedCredentials: mockEncryptedCredentials,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
    };

    const mockFinancialInstitution = {
      id: mockFinancialInstitutionId,
      name: 'Bank of America',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
    };

    const mockInput: GetFinancialInstitutionRelationInput = {
      financialInstitutionRelationId: mockRelationId,
    };

    beforeEach(() => {
      // Mock the decryptText function
      (decryptText as jest.Mock).mockReturnValue(mockDecryptedCredentialsString);
    });

    it('should return company financial institution relation with decrypted credentials', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(mockRelation);
      mockFinancialInstitutionsRepository.getDocument.mockResolvedValue(mockFinancialInstitution);
      
      // Act
      const result = await companiesService.getFinancialInstitution(mockCompanyId, mockInput, mockLogger);

      // Assert
      expect(result).toEqual({
        id: mockRelationId,
        companyId: mockCompanyId,
        credentials: mockCredentials,
        createdAt: mockRelation.createdAt,
        updatedAt: mockRelation.updatedAt,
        financialInstitution: {
          id: mockFinancialInstitutionId,
          name: mockFinancialInstitution.name,
        },
      });

      expect(mockCompanyFinancialInstitutionRelationsRepository.getDocument).toHaveBeenCalledWith(mockRelationId, mockLogger);
      expect(mockFinancialInstitutionsRepository.getDocument).toHaveBeenCalledWith(mockFinancialInstitutionId, mockLogger);
      expect(decryptText).toHaveBeenCalledWith(mockEncryptedCredentials);
    });

    it('should return null when relation is not found', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(null);

      // Act
      const result = await companiesService.getFinancialInstitution(mockCompanyId, mockInput, mockLogger);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when relation belongs to different company', async () => {
      // Arrange
      const differentCompanyRelation = {
        ...mockRelation,
        companyId: 'different-company-id',
      };
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(differentCompanyRelation);

      // Act
      const result = await companiesService.getFinancialInstitution(mockCompanyId, mockInput, mockLogger);

      // Assert
      expect(result).toBeNull();
    });

    it('should throw Error when financial institution is not found', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(mockRelation);
      mockFinancialInstitutionsRepository.getDocument.mockResolvedValue(null);

      // Act & Assert
      await expect(companiesService.getFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow(GET_FINANCIAL_INSTITUTION_RELATION_ERRORS_MESSAGES.FINANCIAL_INSTITUTION_NOT_FOUND);
    });

    it('should call logger methods in the correct order', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(mockRelation);
      mockFinancialInstitutionsRepository.getDocument.mockResolvedValue(mockFinancialInstitution);

      // Act
      await companiesService.getFinancialInstitution(mockCompanyId, mockInput, mockLogger);

      // Assert
      expect(mockLogger.startStep).toHaveBeenNthCalledWith(1, GET_FINANCIAL_INSTITUTION_RELATION_STEPS.GET_RELATION, logGroup);
      expect(mockLogger.endStep).toHaveBeenNthCalledWith(1, GET_FINANCIAL_INSTITUTION_RELATION_STEPS.GET_RELATION);
      expect(mockLogger.startStep).toHaveBeenNthCalledWith(2, GET_FINANCIAL_INSTITUTION_RELATION_STEPS.GET_FINANCIAL_INSTITUTION, logGroup);
      expect(mockLogger.endStep).toHaveBeenNthCalledWith(2, GET_FINANCIAL_INSTITUTION_RELATION_STEPS.GET_FINANCIAL_INSTITUTION);
    });

    it('should ensure logger.endStep is called even if relation getDocument throws an error', async () => {
      // Arrange
      const repositoryError = new Error('Repository error');
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(companiesService.getFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow(repositoryError);

      // Verify that endStep was still called for the GET_RELATION step
      expect(mockLogger.endStep).toHaveBeenCalledWith(GET_FINANCIAL_INSTITUTION_RELATION_STEPS.GET_RELATION);
    });

    it('should ensure logger.endStep is called even if financial institution getDocument throws an error', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(mockRelation);
      mockFinancialInstitutionsRepository.getDocument.mockRejectedValue(new Error('Repository error'));

      // Act & Assert
      await expect(companiesService.getFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow('Repository error');

      // Verify that endStep was still called for the GET_FINANCIAL_INSTITUTION step
      expect(mockLogger.endStep).toHaveBeenCalledWith(GET_FINANCIAL_INSTITUTION_RELATION_STEPS.GET_FINANCIAL_INSTITUTION);
    });
    it('should handle complex nested credential objects', async () => {
      // Arrange
      const complexCredentials = {
        authentication: {
          username: 'complex-user',
          password: 'complex-pass',
          twoFactor: {
            enabled: true,
            secret: 'secret-key',
          },
        },
        api: {
          key: 'api-key-123',
          version: 'v2',
          endpoints: ['/auth', '/data', '/sync'],
        },
        settings: {
          timeout: 30000,
          retries: 3,
          ssl: true,
        },
      };

      (decryptText as jest.Mock).mockReturnValue(JSON.stringify(complexCredentials));
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(mockRelation);
      mockFinancialInstitutionsRepository.getDocument.mockResolvedValue(mockFinancialInstitution);

      // Act
      const result = await companiesService.getFinancialInstitution(mockCompanyId, mockInput, mockLogger);

      // Assert
      expect(result).toMatchObject({
        id: mockRelationId,
        companyId: mockCompanyId,
        credentials: complexCredentials,
        financialInstitution: {
          id: mockFinancialInstitutionId,
          name: mockFinancialInstitution.name,
        },
      });
      expect(result?.credentials.authentication.twoFactor.enabled).toBe(true);
      expect(result?.credentials.api.endpoints).toContain('/auth');
      expect(result?.credentials.settings.timeout).toBe(30000);
    });

    it('should handle credentials with special characters and unicode', async () => {
      // Arrange
      const specialCredentials = {
        username: 'user@domain.com',
        password: 'p@ssw0rd!@#$%^&*()',
        apiKey: 'key-with-unicode-🚀-🎉-🔥',
        notes: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
      };

      (decryptText as jest.Mock).mockReturnValue(JSON.stringify(specialCredentials));
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(mockRelation);
      mockFinancialInstitutionsRepository.getDocument.mockResolvedValue(mockFinancialInstitution);

      // Act
      const result = await companiesService.getFinancialInstitution(mockCompanyId, mockInput, mockLogger);

      // Assert
      expect(result).toMatchObject({
        id: mockRelationId,
        companyId: mockCompanyId,
        credentials: specialCredentials,
        financialInstitution: {
          id: mockFinancialInstitutionId,
          name: mockFinancialInstitution.name,
        },
      });
      expect(result?.credentials.username).toBe('user@domain.com');
      expect(result?.credentials.apiKey).toBe('key-with-unicode-🚀-🎉-🔥');
      expect(result?.credentials.notes).toBe('Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?');
    });

    it('should verify exact object structure of returned item', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocument.mockResolvedValue(mockRelation);
      mockFinancialInstitutionsRepository.getDocument.mockResolvedValue(mockFinancialInstitution);

      // Act
      const result = await companiesService.getFinancialInstitution(mockCompanyId, mockInput, mockLogger);

      // Assert
      expect(result).not.toBeNull();
      
      // Verify all required properties exist
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('companyId');
      expect(result).toHaveProperty('credentials');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
      expect(result).toHaveProperty('financialInstitution');
      expect(result?.financialInstitution).toHaveProperty('id');
      expect(result?.financialInstitution).toHaveProperty('name');

      // Verify property types
      expect(typeof result?.id).toBe('string');
      expect(typeof result?.companyId).toBe('string');
      expect(typeof result?.credentials).toBe('object');
      expect(result?.createdAt).toBeInstanceOf(Date);
      expect(result?.updatedAt).toBeInstanceOf(Date);
      expect(typeof result?.financialInstitution.id).toBe('string');
      expect(typeof result?.financialInstitution.name).toBe('string');

      // Verify exact values
      expect(result?.id).toBe(mockRelationId);
      expect(result?.companyId).toBe(mockCompanyId);
      expect(result?.credentials).toEqual(mockCredentials);
      expect(result?.financialInstitution.id).toBe(mockFinancialInstitutionId);
      expect(result?.financialInstitution.name).toBe('Bank of America');
    });
  });
});
