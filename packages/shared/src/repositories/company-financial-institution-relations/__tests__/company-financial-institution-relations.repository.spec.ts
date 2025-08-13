import { ExecutionLogger } from '../../../definitions';
import { FirestoreCollectionRepository } from '../../../utils/repositories';
import { RepositoryError, RepositoryErrorCode } from '../../../utils/repositories/repositories.errors';
import { CompaniesRepository } from '../../companies/companies.repository';
import { FinancialInstitutionsRepository } from '../../financial-institutions/financial-institutions.repository';
import { CompanyFinancialInstitutionRelationsRepository } from '../company-financial-institution-relations.repository';
import { COLLECTION_PATH, ERROR_MESSAGES, STEPS } from '../company-financial-institution-relations.repository.constants';
import {
  CreateCompanyFinancialInstitutionRelationDocumentInput,
} from '../company-financial-institution-relations.repository.interfaces';

jest.mock('../../../utils/repositories/firestore-collection-repository.class');
jest.mock('../../companies/companies.repository');
jest.mock('../../financial-institutions/financial-institutions.repository');

describe(CompanyFinancialInstitutionRelationsRepository.name, () => {
  let repository: CompanyFinancialInstitutionRelationsRepository;
  let mockLogger: ExecutionLogger;
  let mockCompaniesRepository: jest.Mocked<CompaniesRepository>;
  let mockFinancialInstitutionsRepository: jest.Mocked<FinancialInstitutionsRepository>;

  const mockCompanyId = 'company-123';
  const mockFinancialInstitutionId = 'fi-456';
  const mockEncryptedCredentials = 'encrypted-credentials-data';

  const mockCreateInput: CreateCompanyFinancialInstitutionRelationDocumentInput = {
    companyId: mockCompanyId,
    financialInstitutionId: mockFinancialInstitutionId,
    encryptedCredentials: mockEncryptedCredentials,
  };

  const mockCompanyDocument = {
    id: mockCompanyId,
    name: 'Test Company',
    countryCode: 'US',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFinancialInstitutionDocument = {
    id: mockFinancialInstitutionId,
    name: 'Test Financial Institution',
    countryCode: 'US',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock logger
    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
      warn: jest.fn(),
    } as unknown as ExecutionLogger;

    // Setup mock repositories
    mockCompaniesRepository = {
      getInstance: jest.fn(),
      getDocument: jest.fn(),
    } as unknown as jest.Mocked<CompaniesRepository>;

    mockFinancialInstitutionsRepository = {
      getInstance: jest.fn(),
      getDocument: jest.fn(),
    } as unknown as jest.Mocked<FinancialInstitutionsRepository>;

    // Mock the static getInstance methods
    (CompaniesRepository.getInstance as jest.Mock).mockReturnValue(mockCompaniesRepository);
    (FinancialInstitutionsRepository.getInstance as jest.Mock).mockReturnValue(mockFinancialInstitutionsRepository);
  });

  afterEach(() => {
    // Clear the singleton instance
    (CompanyFinancialInstitutionRelationsRepository as any).instance = undefined;
  });

  describe(CompanyFinancialInstitutionRelationsRepository.getInstance.name, () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = CompanyFinancialInstitutionRelationsRepository.getInstance();
      const instance2 = CompanyFinancialInstitutionRelationsRepository.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should create a new instance when none exists', () => {
      // Clear the instance
      (CompanyFinancialInstitutionRelationsRepository as any).instance = undefined;

      const instance = CompanyFinancialInstitutionRelationsRepository.getInstance();

      expect(instance).toBeInstanceOf(CompanyFinancialInstitutionRelationsRepository);
    });
  });

  describe('constructor', () => {
    it('should call parent constructor with correct collection path', () => {
      new CompanyFinancialInstitutionRelationsRepository();
      expect(FirestoreCollectionRepository).toHaveBeenCalledWith({
        collectionPath: COLLECTION_PATH
      });
    });

    it('should call parent constructor exactly once', () => {
      new CompanyFinancialInstitutionRelationsRepository();
      expect(FirestoreCollectionRepository).toHaveBeenCalledTimes(1);
    });
  });

  describe('static properties', () => {
    it('should have correct COLLECTION_PATH constant', () => {
      expect(CompanyFinancialInstitutionRelationsRepository.COLLECTION_PATH).toBe(COLLECTION_PATH);
    });
  });

  describe('createDocument validation', () => {
    beforeEach(() => {
      repository = CompanyFinancialInstitutionRelationsRepository.getInstance();
    });

    it('should throw RepositoryError when company is not found', async () => {
      // Mock the dependent repositories - company not found
      mockCompaniesRepository.getDocument.mockResolvedValue(null);
      mockFinancialInstitutionsRepository.getDocument.mockResolvedValue(mockFinancialInstitutionDocument);

      try {
        await repository.createDocument(mockCreateInput, mockLogger);
        expect(false).toBe(true);
      } catch (error: any) {
        expect(error).toBeInstanceOf(RepositoryError);
        expect(error.code).toBe(RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND);
        expect(error.message).toBe(ERROR_MESSAGES.COMPANY_NOT_FOUND);
        expect(error.data).toEqual({ companyId: mockCompanyId });
      }

      // Verify that the related documents were fetched
      expect(mockCompaniesRepository.getDocument).toHaveBeenCalledWith(mockCompanyId, mockLogger);
      expect(mockFinancialInstitutionsRepository.getDocument).toHaveBeenCalledWith(mockFinancialInstitutionId, mockLogger);

      // Verify logging
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_RELATED_DOCUMENTS.id, `${repository.constructor.name}.${repository.createDocument.name}`);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_RELATED_DOCUMENTS.id);
    });

    it('should throw RepositoryError when financial institution is not found', async () => {
      // Mock the dependent repositories - financial institution not found
      mockCompaniesRepository.getDocument.mockResolvedValue(mockCompanyDocument);
      mockFinancialInstitutionsRepository.getDocument.mockResolvedValue(null);

      try {
        await repository.createDocument(mockCreateInput, mockLogger);
        expect(false).toBe(true);
      } catch (error: any) {
        expect(error).toBeInstanceOf(RepositoryError);
        expect(error.code).toBe(RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND);
        expect(error.message).toBe(ERROR_MESSAGES.FINANCIAL_INSTITUTION_NOT_FOUND);
        expect(error.data).toEqual({ financialInstitutionId: mockFinancialInstitutionId });
      }

      // Verify that the related documents were fetched
      expect(mockCompaniesRepository.getDocument).toHaveBeenCalledWith(mockCompanyId, mockLogger);
      expect(mockFinancialInstitutionsRepository.getDocument).toHaveBeenCalledWith(mockFinancialInstitutionId, mockLogger);

      // Verify logging
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_RELATED_DOCUMENTS.id, `${repository.constructor.name}.${repository.createDocument.name}`);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_RELATED_DOCUMENTS.id);
    });

    it('should successfully create a document', async () => {
      const newDocumentId = 'new-document-id';
      // Mock the dependent repositories - company and financial institution found
      mockCompaniesRepository.getDocument.mockResolvedValue(mockCompanyDocument);
      mockFinancialInstitutionsRepository.getDocument.mockResolvedValue(mockFinancialInstitutionDocument);
      jest.spyOn(FirestoreCollectionRepository.prototype, 'createDocument').mockResolvedValue(newDocumentId);

      const result = await repository.createDocument(mockCreateInput, mockLogger);

      expect(result).toBe(newDocumentId);

      expect(mockCompaniesRepository.getDocument).toHaveBeenCalledWith(mockCreateInput.companyId, mockLogger);
      expect(mockFinancialInstitutionsRepository.getDocument).toHaveBeenCalledWith(mockCreateInput.financialInstitutionId, mockLogger);
      expect(repository.createDocument).toHaveBeenCalledWith(mockCreateInput, mockLogger);
    });

    it('should handle errors from dependent repository calls', async () => {
      const mockError = new Error('Database connection failed');
      
      // Mock the dependent repositories to throw errors
      mockCompaniesRepository.getDocument.mockRejectedValue(mockError);
      mockFinancialInstitutionsRepository.getDocument.mockResolvedValue(mockFinancialInstitutionDocument);

      await expect(repository.createDocument(mockCreateInput, mockLogger)).rejects.toThrow(mockError);

      // Verify that the related documents were fetched
      expect(mockCompaniesRepository.getDocument).toHaveBeenCalledWith(mockCompanyId, mockLogger);
      expect(mockFinancialInstitutionsRepository.getDocument).toHaveBeenCalledWith(mockFinancialInstitutionId, mockLogger);

      // Verify logging
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_RELATED_DOCUMENTS.id, `${repository.constructor.name}.${repository.createDocument.name}`);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_RELATED_DOCUMENTS.id);
    });
  });
});
