import { ExecutionLogger } from '../../../definitions';
import { RepositoryError, RepositoryErrorCode } from '../../../utils/repositories/repositories.errors';
import { CompaniesRepository } from '../../companies/companies.repository';
import { FinancialInstitutionsRepository } from '../../financial-institutions/financial-institutions.repository';
import { CompanyFinancialInstitutionRelationsRepository } from '../company-financial-institution-relations.repository';
import { ERROR_MESSAGES, MOCK_COMPANY_FINANCIAL_INSTITUTION_RELATIONS, STEPS } from '../company-financial-institution-relations.repository.constants';
import {
  CreateCompanyFinancialInstitutionRelationDocumentInput,
} from '../company-financial-institution-relations.repository.interfaces';

// Mock the dependent repositories
jest.mock('../../companies/companies.repository');
jest.mock('../../financial-institutions/financial-institutions.repository');

const MockedCompaniesRepository = CompaniesRepository as jest.MockedClass<typeof CompaniesRepository>;
const MockedFinancialInstitutionsRepository = FinancialInstitutionsRepository as jest.MockedClass<typeof FinancialInstitutionsRepository>;

describe(CompanyFinancialInstitutionRelationsRepository.name, () => {
  let repository: CompanyFinancialInstitutionRelationsRepository;
  let mockLogger: ExecutionLogger;
  let mockCompaniesRepository: CompaniesRepository;
  let mockFinancialInstitutionsRepository: FinancialInstitutionsRepository;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock logger
    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      fatal: jest.fn(),
      lastStep: { id: '', label: '', startTime: 0 },
      stepsCounter: 0,
      initTime: 0,
      getStepElapsedTime: jest.fn(),
      getTotalElapsedTime: jest.fn(),
      reset: jest.fn(),
    } as unknown as ExecutionLogger;

    // Create mock repository instances
    mockCompaniesRepository = {
      getDocument: jest.fn(),
      createDocument: jest.fn(),
      deleteDocument: jest.fn(),
      getDocumentsList: jest.fn(),
      updateDocument: jest.fn(),
    } as unknown as CompaniesRepository;

    mockFinancialInstitutionsRepository = {
      getDocument: jest.fn(),
      createDocument: jest.fn(),
      deleteDocument: jest.fn(),
      getDocumentsList: jest.fn(),
      updateDocument: jest.fn(),
    } as unknown as FinancialInstitutionsRepository;

    // Setup static method mocks
    (MockedCompaniesRepository.getInstance as jest.Mock).mockReturnValue(mockCompaniesRepository);
    (MockedFinancialInstitutionsRepository.getInstance as jest.Mock).mockReturnValue(mockFinancialInstitutionsRepository);

    // Get repository instance
    repository = CompanyFinancialInstitutionRelationsRepository.getInstance();
  });

  afterEach(() => {
    // Reset the singleton instance to ensure clean state between tests
    (CompanyFinancialInstitutionRelationsRepository as any).instance = undefined;
  });

  describe(CompanyFinancialInstitutionRelationsRepository.getInstance.name, () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = CompanyFinancialInstitutionRelationsRepository.getInstance();
      const instance2 = CompanyFinancialInstitutionRelationsRepository.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should initialize with mock data', async () => {
      const instance = CompanyFinancialInstitutionRelationsRepository.getInstance();
      const documents = await instance.getDocumentsList({}, mockLogger);

      expect(documents).toHaveLength(MOCK_COMPANY_FINANCIAL_INSTITUTION_RELATIONS.length);
      expect(documents[0]).toEqual(MOCK_COMPANY_FINANCIAL_INSTITUTION_RELATIONS[0]);
    });
  });

  describe(CompanyFinancialInstitutionRelationsRepository.prototype.createDocument.name, () => {
    const validCreateInput: CreateCompanyFinancialInstitutionRelationDocumentInput = {
      companyId: '0',
      financialInstitutionId: '0',
      encryptedCredentials: 'test-encrypted-credentials',
    };

    const mockCompany = {
      id: '0',
      name: 'Test Company',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockFinancialInstitution = {
      id: '0',
      name: 'Test Financial Institution',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      // Setup default successful responses
      (mockCompaniesRepository.getDocument as jest.Mock).mockResolvedValue(mockCompany);
      (mockFinancialInstitutionsRepository.getDocument as jest.Mock).mockResolvedValue(mockFinancialInstitution);
    });

    it('should create a document successfully when both company and financial institution exist', async () => {
      const result = await repository.createDocument(validCreateInput, mockLogger);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');

      // Verify logger calls
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_RELATED_DOCUMENTS.id, expect.stringContaining('createDocument'));
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_RELATED_DOCUMENTS.id);

      // Verify repository calls
      expect(mockCompaniesRepository.getDocument).toHaveBeenCalledWith(validCreateInput.companyId, mockLogger);
      expect(mockFinancialInstitutionsRepository.getDocument).toHaveBeenCalledWith(validCreateInput.financialInstitutionId, mockLogger);
    });

    it('should throw RepositoryError when company is not found', async () => {
      (mockCompaniesRepository.getDocument as jest.Mock).mockResolvedValue(null);

      await expect(repository.createDocument(validCreateInput, mockLogger)).rejects.toThrow(RepositoryError);

      try {
        await repository.createDocument(validCreateInput, mockLogger);
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);
        expect((error as RepositoryError).code).toBe(RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND);
        expect((error as RepositoryError).message).toBe(ERROR_MESSAGES.COMPANY_NOT_FOUND);
        expect((error as RepositoryError).data).toEqual({ companyId: validCreateInput.companyId });
      }
    });

    it('should throw RepositoryError when financial institution is not found', async () => {
      (mockFinancialInstitutionsRepository.getDocument as jest.Mock).mockResolvedValue(null);

      await expect(repository.createDocument(validCreateInput, mockLogger)).rejects.toThrow(RepositoryError);

      try {
        await repository.createDocument(validCreateInput, mockLogger);
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);
        expect((error as RepositoryError).code).toBe(RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND);
        expect((error as RepositoryError).message).toBe(ERROR_MESSAGES.FINANCIAL_INSTITUTION_NOT_FOUND);
        expect((error as RepositoryError).data).toEqual({ financialInstitutionId: validCreateInput.financialInstitutionId });
      }
    });

    it('should throw RepositoryError when both company and financial institution are not found', async () => {
      (mockCompaniesRepository.getDocument as jest.Mock).mockResolvedValue(null);
      (mockFinancialInstitutionsRepository.getDocument as jest.Mock).mockResolvedValue(null);

      await expect(repository.createDocument(validCreateInput, mockLogger)).rejects.toThrow(RepositoryError);

      try {
        await repository.createDocument(validCreateInput, mockLogger);
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);
        expect((error as RepositoryError).code).toBe(RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND);
        expect((error as RepositoryError).message).toBe(ERROR_MESSAGES.COMPANY_NOT_FOUND);
        expect((error as RepositoryError).data).toEqual({ companyId: validCreateInput.companyId });
      }
    });


  });

  describe('inherited methods', () => {
    it('should be able to get a document by ID', async () => {
      const document = await repository.getDocument('0', mockLogger);

      expect(document).toBeDefined();
      expect(document?.id).toBe('0');
      expect(document?.companyId).toBe('0');
      expect(document?.financialInstitutionId).toBe('0');
    });

    it('should be able to get documents list', async () => {
      const documents = await repository.getDocumentsList({}, mockLogger);

      expect(documents).toHaveLength(MOCK_COMPANY_FINANCIAL_INSTITUTION_RELATIONS.length);
      expect(documents).toEqual(expect.arrayContaining(MOCK_COMPANY_FINANCIAL_INSTITUTION_RELATIONS));
    });

    it('should be able to update a document', async () => {
      const updateData = { encryptedCredentials: 'updated-credentials' };

      await expect(repository.updateDocument('0', updateData, mockLogger)).resolves.not.toThrow();
    });

    it('should be able to delete a document', async () => {
      await expect(repository.deleteDocument('0', mockLogger)).resolves.not.toThrow();
    });
    it('should handle repository getDocument errors gracefully', async () => {
      const repositoryError = new Error('Database connection failed');
      (mockCompaniesRepository.getDocument as jest.Mock).mockRejectedValue(repositoryError);

      await expect(repository.createDocument({
        companyId: '0',
        financialInstitutionId: '0',
        encryptedCredentials: 'test',
      }, mockLogger)).rejects.toThrow('Database connection failed');
    });

    it('should ensure logger.endStep is called even when an error occurs', async () => {
      (mockCompaniesRepository.getDocument as jest.Mock).mockResolvedValue(null);

      try {
        await repository.createDocument({
          companyId: '0',
          financialInstitutionId: '0',
          encryptedCredentials: 'test',
        }, mockLogger);
      } catch (error) {
        // Error is expected
      }

      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_RELATED_DOCUMENTS.id);
    });
  });
}); 