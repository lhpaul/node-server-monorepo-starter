// Internal modules (farthest path first, then alphabetical)
import { ExecutionLogger } from '../../../definitions';
import { FinancialInstitution } from '../../../domain';
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
  GetFinancialInstitutionRelationError,
  GetFinancialInstitutionRelationErrorCode,
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
      getDocumentsList: jest.fn(),
      deleteDocument: jest.fn(),
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
    const mockFinancialInstitutionId = 'fi-456';
    const mockCredentials = { username: 'newuser', password: 'newpass', apiKey: 'new-api-key' };
    const mockInput: UpdateCompanyFinancialInstitutionInput = {
      financialInstitutionId: mockFinancialInstitutionId,
      credentials: mockCredentials,
    };
    const mockRelation = {
      id: 'relation-789',
      companyId: mockCompanyId,
      financialInstitutionId: mockFinancialInstitutionId,
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
        financialInstitutionId: mockFinancialInstitutionId,
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

    it('should throw UpdateFinancialInstitutionError when no relation is found', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([]);

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
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([mockRelation]);
      mockCompanyFinancialInstitutionRelationsRepository.updateDocument.mockResolvedValue();

      // Act
      await companiesService.updateFinancialInstitution(mockCompanyId, mockInput, mockLogger);

      // Assert
      expect(mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList).toHaveBeenCalledWith({
        companyId: [{ value: mockCompanyId, operator: '==' }],
        financialInstitutionId: [{ value: mockFinancialInstitutionId, operator: '==' }],
      }, mockLogger);
      expect(encryptText).toHaveBeenCalledWith(JSON.stringify(mockCredentials));
      expect(mockCompanyFinancialInstitutionRelationsRepository.updateDocument).toHaveBeenCalledWith(mockRelation.id, {
        encryptedCredentials: 'encrypted-credentials',
      }, mockLogger);
      expect(mockLogger.startStep).toHaveBeenCalledWith(UPDATE_FINANCIAL_INSTITUTION_STEPS.FIND_RELATION, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(UPDATE_FINANCIAL_INSTITUTION_STEPS.FIND_RELATION);
      expect(mockLogger.startStep).toHaveBeenCalledWith(UPDATE_FINANCIAL_INSTITUTION_STEPS.ENCRYPT_CREDENTIALS, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(UPDATE_FINANCIAL_INSTITUTION_STEPS.ENCRYPT_CREDENTIALS);
      expect(mockLogger.startStep).toHaveBeenCalledWith(UPDATE_FINANCIAL_INSTITUTION_STEPS.UPDATE_RELATION, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(UPDATE_FINANCIAL_INSTITUTION_STEPS.UPDATE_RELATION);
    });

    it('should handle empty credentials object', async () => {
      // Arrange
      const emptyCredentialsInput: UpdateCompanyFinancialInstitutionInput = {
        financialInstitutionId: mockFinancialInstitutionId,
        credentials: {},
      };
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([mockRelation]);
      mockCompanyFinancialInstitutionRelationsRepository.updateDocument.mockResolvedValue();

      // Act
      await companiesService.updateFinancialInstitution(mockCompanyId, emptyCredentialsInput, mockLogger);

      // Assert
      expect(encryptText).toHaveBeenCalledWith('{}');
      expect(mockCompanyFinancialInstitutionRelationsRepository.updateDocument).toHaveBeenCalledWith(mockRelation.id, {
        encryptedCredentials: 'encrypted-credentials',
      }, mockLogger);
    });

    it('should handle null credentials', async () => {
      // Arrange
      const nullCredentialsInput: UpdateCompanyFinancialInstitutionInput = {
        financialInstitutionId: mockFinancialInstitutionId,
        credentials: null as any,
      };
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([mockRelation]);
      mockCompanyFinancialInstitutionRelationsRepository.updateDocument.mockResolvedValue();

      // Act
      await companiesService.updateFinancialInstitution(mockCompanyId, nullCredentialsInput, mockLogger);

      // Assert
      expect(encryptText).toHaveBeenCalledWith('null');
      expect(mockCompanyFinancialInstitutionRelationsRepository.updateDocument).toHaveBeenCalledWith(mockRelation.id, {
        encryptedCredentials: 'encrypted-credentials',
      }, mockLogger);
    });

    it('should handle primitive credentials', async () => {
      // Arrange
      const primitiveCredentialsInput: UpdateCompanyFinancialInstitutionInput = {
        financialInstitutionId: mockFinancialInstitutionId,
        credentials: 'simple-string' as any,
      };
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([mockRelation]);
      mockCompanyFinancialInstitutionRelationsRepository.updateDocument.mockResolvedValue();

      // Act
      await companiesService.updateFinancialInstitution(mockCompanyId, primitiveCredentialsInput, mockLogger);

      // Assert
      expect(encryptText).toHaveBeenCalledWith('"simple-string"');
      expect(mockCompanyFinancialInstitutionRelationsRepository.updateDocument).toHaveBeenCalledWith(mockRelation.id, {
        encryptedCredentials: 'encrypted-credentials',
      }, mockLogger);
    });

    it('should handle multiple relations and update the first one', async () => {
      // Arrange
      const mockRelations = [
        mockRelation,
        {
          id: 'relation-790',
          companyId: mockCompanyId,
          financialInstitutionId: mockFinancialInstitutionId,
          encryptedCredentials: 'encrypted-credentials-2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue(mockRelations);
      mockCompanyFinancialInstitutionRelationsRepository.updateDocument.mockResolvedValue();

      // Act
      await companiesService.updateFinancialInstitution(mockCompanyId, mockInput, mockLogger);

      // Assert
      expect(mockCompanyFinancialInstitutionRelationsRepository.updateDocument).toHaveBeenCalledWith(mockRelations[0].id, {
        encryptedCredentials: 'encrypted-credentials',
      }, mockLogger);
      expect(mockCompanyFinancialInstitutionRelationsRepository.updateDocument).toHaveBeenCalledTimes(1);
    });

    it('should ensure logger.endStep is called even if updateDocument throws an error', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([mockRelation]);
      const repositoryError = new Error('Repository error');
      mockCompanyFinancialInstitutionRelationsRepository.updateDocument.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(companiesService.updateFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow(repositoryError);

      // Verify that endStep was still called for the UPDATE_RELATION step
      expect(mockLogger.endStep).toHaveBeenCalledWith(UPDATE_FINANCIAL_INSTITUTION_STEPS.UPDATE_RELATION);
    });

    it('should ensure logger.endStep is called even if getDocumentsList throws an error', async () => {
      // Arrange
      const repositoryError = new Error('Repository error');
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(companiesService.updateFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow(repositoryError);

      // Verify that endStep was still called for the FIND_RELATION step
      expect(mockLogger.endStep).toHaveBeenCalledWith(UPDATE_FINANCIAL_INSTITUTION_STEPS.FIND_RELATION);
    });

    it('should call logger methods in the correct order', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([mockRelation]);
      mockCompanyFinancialInstitutionRelationsRepository.updateDocument.mockResolvedValue();

      // Act
      await companiesService.updateFinancialInstitution(mockCompanyId, mockInput, mockLogger);

      // Assert
      expect(mockLogger.startStep).toHaveBeenNthCalledWith(1, UPDATE_FINANCIAL_INSTITUTION_STEPS.FIND_RELATION, logGroup);
      expect(mockLogger.endStep).toHaveBeenNthCalledWith(1, UPDATE_FINANCIAL_INSTITUTION_STEPS.FIND_RELATION);
      expect(mockLogger.startStep).toHaveBeenNthCalledWith(2, UPDATE_FINANCIAL_INSTITUTION_STEPS.ENCRYPT_CREDENTIALS, logGroup);
      expect(mockLogger.endStep).toHaveBeenNthCalledWith(2, UPDATE_FINANCIAL_INSTITUTION_STEPS.ENCRYPT_CREDENTIALS);
      expect(mockLogger.startStep).toHaveBeenNthCalledWith(3, UPDATE_FINANCIAL_INSTITUTION_STEPS.UPDATE_RELATION, logGroup);
      expect(mockLogger.endStep).toHaveBeenNthCalledWith(3, UPDATE_FINANCIAL_INSTITUTION_STEPS.UPDATE_RELATION);
    });

    it('should handle repository getDocumentsList errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockRejectedValue(repositoryError);

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
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([mockRelation]);
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
        financialInstitutionId: mockFinancialInstitutionId,
        credentials: complexCredentials,
      };
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([mockRelation]);
      mockCompanyFinancialInstitutionRelationsRepository.updateDocument.mockResolvedValue();

      // Act
      await companiesService.updateFinancialInstitution(mockCompanyId, complexInput, mockLogger);

      // Assert
      expect(encryptText).toHaveBeenCalledWith(JSON.stringify(complexCredentials));
      expect(mockCompanyFinancialInstitutionRelationsRepository.updateDocument).toHaveBeenCalledWith(mockRelation.id, {
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
        financialInstitutionId: mockFinancialInstitutionId,
        credentials: specialCredentials,
      };
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([mockRelation]);
      mockCompanyFinancialInstitutionRelationsRepository.updateDocument.mockResolvedValue();

      // Act
      await companiesService.updateFinancialInstitution(mockCompanyId, specialInput, mockLogger);

      // Assert
      expect(encryptText).toHaveBeenCalledWith(JSON.stringify(specialCredentials));
      expect(mockCompanyFinancialInstitutionRelationsRepository.updateDocument).toHaveBeenCalledWith(mockRelation.id, {
        encryptedCredentials: 'encrypted-credentials',
      }, mockLogger);
    });
  });

  describe(CompaniesService.prototype.removeFinancialInstitution.name, () => {
    const mockCompanyId = 'company-123';
    const mockFinancialInstitutionId = 'fi-456';
    const mockInput: RemoveFinancialInstitutionInput = {
      financialInstitutionId: mockFinancialInstitutionId,
    };
    const mockRelation = {
      id: 'relation-789',
      companyId: mockCompanyId,
      financialInstitutionId: mockFinancialInstitutionId,
      encryptedCredentials: 'encrypted-credentials',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const logGroup = `${CompaniesService.name}.${CompaniesService.prototype.removeFinancialInstitution.name}`;

    it('should successfully remove a financial institution from a company', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([mockRelation]);
      mockCompanyFinancialInstitutionRelationsRepository.deleteDocument.mockResolvedValue();

      // Act
      await companiesService.removeFinancialInstitution(mockCompanyId, mockInput, mockLogger);

      // Assert
      expect(mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList).toHaveBeenCalledWith({
        companyId: [{ value: mockCompanyId, operator: '==' }],
        financialInstitutionId: [{ value: mockFinancialInstitutionId, operator: '==' }],
      }, mockLogger);
      expect(mockCompanyFinancialInstitutionRelationsRepository.deleteDocument).toHaveBeenCalledWith(mockRelation.id, mockLogger);
      expect(mockLogger.startStep).toHaveBeenCalledWith(REMOVE_FINANCIAL_INSTITUTION_STEPS.FIND_RELATION, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(REMOVE_FINANCIAL_INSTITUTION_STEPS.FIND_RELATION);
      expect(mockLogger.startStep).toHaveBeenCalledWith(REMOVE_FINANCIAL_INSTITUTION_STEPS.DELETE_RELATION, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(REMOVE_FINANCIAL_INSTITUTION_STEPS.DELETE_RELATION);
    });

    it('should throw RemoveFinancialInstitutionError when no relation is found', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([]);

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

    it('should handle multiple relations and delete the first one', async () => {
      // Arrange
      const mockRelations = [
        mockRelation,
        {
          id: 'relation-790',
          companyId: mockCompanyId,
          financialInstitutionId: mockFinancialInstitutionId,
          encryptedCredentials: 'encrypted-credentials-2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue(mockRelations);
      mockCompanyFinancialInstitutionRelationsRepository.deleteDocument.mockResolvedValue();

      // Act
      await companiesService.removeFinancialInstitution(mockCompanyId, mockInput, mockLogger);

      // Assert
      expect(mockCompanyFinancialInstitutionRelationsRepository.deleteDocument).toHaveBeenCalledWith(mockRelations[0].id, mockLogger);
      expect(mockCompanyFinancialInstitutionRelationsRepository.deleteDocument).toHaveBeenCalledTimes(1);
    });

    it('should ensure logger.endStep is called even if deleteDocument throws an error', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([mockRelation]);
      const repositoryError = new Error('Repository error');
      mockCompanyFinancialInstitutionRelationsRepository.deleteDocument.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(companiesService.removeFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow(repositoryError);

      // Verify that endStep was still called for the DELETE_RELATION step
      expect(mockLogger.endStep).toHaveBeenCalledWith(REMOVE_FINANCIAL_INSTITUTION_STEPS.DELETE_RELATION);
    });

    it('should call logger methods in the correct order', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([mockRelation]);
      mockCompanyFinancialInstitutionRelationsRepository.deleteDocument.mockResolvedValue();

      // Act
      await companiesService.removeFinancialInstitution(mockCompanyId, mockInput, mockLogger);

      // Assert
      expect(mockLogger.startStep).toHaveBeenNthCalledWith(1, REMOVE_FINANCIAL_INSTITUTION_STEPS.FIND_RELATION, logGroup);
      expect(mockLogger.endStep).toHaveBeenNthCalledWith(1, REMOVE_FINANCIAL_INSTITUTION_STEPS.FIND_RELATION);
      expect(mockLogger.startStep).toHaveBeenNthCalledWith(2, REMOVE_FINANCIAL_INSTITUTION_STEPS.DELETE_RELATION, logGroup);
      expect(mockLogger.endStep).toHaveBeenNthCalledWith(2, REMOVE_FINANCIAL_INSTITUTION_STEPS.DELETE_RELATION);
    });

    it('should handle repository getDocumentsList errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(companiesService.removeFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow('Database connection failed');

      // Verify that deleteDocument was not called
      expect(mockCompanyFinancialInstitutionRelationsRepository.deleteDocument).not.toHaveBeenCalled();
    });

    it('should handle repository deleteDocument errors gracefully', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([mockRelation]);
      const repositoryError = new Error('Delete operation failed');
      mockCompanyFinancialInstitutionRelationsRepository.deleteDocument.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(companiesService.removeFinancialInstitution(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow('Delete operation failed');
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
      expect(result[0]).toBeInstanceOf(FinancialInstitution);
      expect(result[1]).toBeInstanceOf(FinancialInstitution);
      expect(result[2]).toBeInstanceOf(FinancialInstitution);
      expect(result[0]).toMatchObject(mockFinancialInstitution1);
      expect(result[1]).toMatchObject(mockFinancialInstitution2);
      expect(result[2]).toMatchObject(mockFinancialInstitution3);

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
      expect(result[0]).toBeInstanceOf(FinancialInstitution);
      expect(result[1]).toBeInstanceOf(FinancialInstitution);
      expect(result[0]).toMatchObject(mockFinancialInstitution1);
      expect(result[1]).toMatchObject(mockFinancialInstitution3);

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
      expect(result[0]).toBeInstanceOf(FinancialInstitution);
      expect(result[0]).toMatchObject(mockFinancialInstitution1);

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
  });

  describe(CompaniesService.prototype.getFinancialInstitutionRelation.name, () => {
    const mockCompanyId = 'company-1';
    const mockFinancialInstitutionId = 'fi-1';
    const mockRelationId = 'relation-1';
    const mockCredentials = { username: 'testuser', password: 'testpass' };
    const mockEncryptedCredentials = 'encrypted-credentials-string';
    const mockDecryptedCredentialsString = JSON.stringify(mockCredentials);
    const logGroup = `${CompaniesService.name}.${CompaniesService.prototype.getFinancialInstitutionRelation.name}`;

    const mockRelation = {
      id: mockRelationId,
      companyId: mockCompanyId,
      financialInstitutionId: mockFinancialInstitutionId,
      encryptedCredentials: mockEncryptedCredentials,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
    };

    const mockInput: GetFinancialInstitutionRelationInput = {
      financialInstitutionId: mockFinancialInstitutionId,
    };

    beforeEach(() => {
      // Mock the decryptText function
      (decryptText as jest.Mock).mockReturnValue(mockDecryptedCredentialsString);
    });

    it('should return company financial institution relation with decrypted credentials', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([mockRelation]);

      // Act
      const result = await companiesService.getFinancialInstitutionRelation(mockCompanyId, mockInput, mockLogger);

      // Assert
      expect(result).toEqual({
        id: mockRelationId,
        companyId: mockCompanyId,
        financialInstitutionId: mockFinancialInstitutionId,
        credentials: mockCredentials,
        createdAt: mockRelation.createdAt,
        updatedAt: mockRelation.updatedAt,
      });

      expect(mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList).toHaveBeenCalledWith({
        companyId: [{ value: mockCompanyId, operator: '==' }],
        financialInstitutionId: [{ value: mockFinancialInstitutionId, operator: '==' }],
      }, mockLogger);

      expect(decryptText).toHaveBeenCalledWith(mockEncryptedCredentials);
    });

    it('should throw GetFinancialInstitutionRelationError when relation is not found', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([]);

      // Act & Assert
      await expect(companiesService.getFinancialInstitutionRelation(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow(GetFinancialInstitutionRelationError);

      await expect(companiesService.getFinancialInstitutionRelation(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toMatchObject({
          code: GetFinancialInstitutionRelationErrorCode.RELATION_NOT_FOUND,
          message: GET_FINANCIAL_INSTITUTION_RELATION_ERRORS_MESSAGES.RELATION_NOT_FOUND,
        });
    });

    it('should throw GetFinancialInstitutionRelationError when decryption fails', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([mockRelation]);
      const decryptionError = new Error('Decryption failed');
      (decryptText as jest.Mock).mockImplementation(() => {
        throw decryptionError;
      });

      // Act & Assert
      await expect(companiesService.getFinancialInstitutionRelation(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow(GetFinancialInstitutionRelationError);

      await expect(companiesService.getFinancialInstitutionRelation(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toMatchObject({
          code: GetFinancialInstitutionRelationErrorCode.DECRYPTION_FAILED,
          message: GET_FINANCIAL_INSTITUTION_RELATION_ERRORS_MESSAGES.DECRYPTION_FAILED,
        });
    });

    it('should throw GetFinancialInstitutionRelationError when credentials JSON parsing fails', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([mockRelation]);
      (decryptText as jest.Mock).mockReturnValue('invalid-json');

      // Act & Assert
      await expect(companiesService.getFinancialInstitutionRelation(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow(GetFinancialInstitutionRelationError);

      await expect(companiesService.getFinancialInstitutionRelation(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toMatchObject({
          code: GetFinancialInstitutionRelationErrorCode.INVALID_CREDENTIALS_FORMAT,
          message: GET_FINANCIAL_INSTITUTION_RELATION_ERRORS_MESSAGES.INVALID_CREDENTIALS_FORMAT,
        });
    });

    it('should call logger methods in the correct order', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([mockRelation]);

      // Act
      await companiesService.getFinancialInstitutionRelation(mockCompanyId, mockInput, mockLogger);

      // Assert
      expect(mockLogger.startStep).toHaveBeenNthCalledWith(1, GET_FINANCIAL_INSTITUTION_RELATION_STEPS.FIND_RELATION, logGroup);
      expect(mockLogger.endStep).toHaveBeenNthCalledWith(1, GET_FINANCIAL_INSTITUTION_RELATION_STEPS.FIND_RELATION);
      expect(mockLogger.startStep).toHaveBeenNthCalledWith(2, GET_FINANCIAL_INSTITUTION_RELATION_STEPS.DECRYPT_CREDENTIALS, logGroup);
      expect(mockLogger.endStep).toHaveBeenNthCalledWith(2, GET_FINANCIAL_INSTITUTION_RELATION_STEPS.DECRYPT_CREDENTIALS);
      expect(mockLogger.startStep).toHaveBeenNthCalledWith(3, GET_FINANCIAL_INSTITUTION_RELATION_STEPS.PARSE_CREDENTIALS, logGroup);
      expect(mockLogger.endStep).toHaveBeenNthCalledWith(3, GET_FINANCIAL_INSTITUTION_RELATION_STEPS.PARSE_CREDENTIALS);
    });

    it('should ensure logger.endStep is called even if getDocumentsList throws an error', async () => {
      // Arrange
      const repositoryError = new Error('Repository error');
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(companiesService.getFinancialInstitutionRelation(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow(repositoryError);

      // Verify that endStep was still called for the FIND_RELATION step
      expect(mockLogger.endStep).toHaveBeenCalledWith(GET_FINANCIAL_INSTITUTION_RELATION_STEPS.FIND_RELATION);
    });

    it('should ensure logger.endStep is called even if decryptText throws an error', async () => {
      // Arrange
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockResolvedValue([mockRelation]);
      const decryptionError = new Error('Decryption failed');
      (decryptText as jest.Mock).mockImplementation(() => {
        throw decryptionError;
      });

      // Act & Assert
      await expect(companiesService.getFinancialInstitutionRelation(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toMatchObject({
          code: GetFinancialInstitutionRelationErrorCode.DECRYPTION_FAILED,
          message: GET_FINANCIAL_INSTITUTION_RELATION_ERRORS_MESSAGES.DECRYPTION_FAILED,
        });

      // Verify that endStep was still called for the FIND_RELATION step
      expect(mockLogger.endStep).toHaveBeenCalledWith(GET_FINANCIAL_INSTITUTION_RELATION_STEPS.FIND_RELATION);
    });

    it('should handle repository getDocumentsList errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockCompanyFinancialInstitutionRelationsRepository.getDocumentsList.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(companiesService.getFinancialInstitutionRelation(mockCompanyId, mockInput, mockLogger))
        .rejects
        .toThrow('Database connection failed');

      // Verify that decryptText was not called
      expect(decryptText).not.toHaveBeenCalled();
    });
  });
}); 