// Internal modules (farthest path first, then alphabetical)
import { ExecutionLogger } from '../../../../definitions';
import { FinancialInstitution } from '../../..';
import {
  FinancialInstitutionDocument,
  FinancialInstitutionsRepository,
} from '../../../../repositories';
import { RepositoryError, RepositoryErrorCode } from '../../../../utils/repositories';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '../../../../utils/services';

// Local imports (alphabetical)
import {
  CreateFinancialInstitutionInput,
  FilterFinancialInstitutionsInput,
  UpdateFinancialInstitutionInput,
} from '../financial-institutions.service.interfaces';
import { FinancialInstitutionsService } from '../financial-institutions.service';

// Mock the repository
jest.mock('../../../../repositories/financial-institutions/financial-institutions.repository');

describe(FinancialInstitutionsService.name, () => {
  let service: FinancialInstitutionsService;
  let mockRepository: jest.Mocked<FinancialInstitutionsRepository>;
  let mockLogger: jest.Mocked<ExecutionLogger>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock logger
    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
      logError: jest.fn(),
    } as any;

    // Mock the repository instance
    mockRepository = {
      createDocument: jest.fn(),
      deleteDocument: jest.fn(),
      getDocument: jest.fn(),
      getDocumentsList: jest.fn(),
      updateDocument: jest.fn(),
    } as any;

    // Mock the getInstance method
    (FinancialInstitutionsRepository.getInstance as jest.Mock).mockReturnValue(mockRepository);

    // Get service instance
    service = FinancialInstitutionsService.getInstance();
  });

  afterEach(() => {
    // Reset the singleton instance for each test
    (FinancialInstitutionsService as any).instance = undefined;
  });

  describe(FinancialInstitutionsService.getInstance.name, () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = FinancialInstitutionsService.getInstance();
      const instance2 = FinancialInstitutionsService.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should create a new instance only once', () => {
      const instance1 = FinancialInstitutionsService.getInstance();
      
      // Reset the instance
      (FinancialInstitutionsService as any).instance = undefined;
      
      const instance2 = FinancialInstitutionsService.getInstance();

      expect(instance1).not.toBe(instance2);
    });
  });

  describe(FinancialInstitutionsService.prototype.createResource.name, () => {
    const createInput: CreateFinancialInstitutionInput = {
      countryCode: 'US',
      name: 'Test Bank',
    };
    const documentId = 'fi-123';

    it('should create a financial institution successfully', async () => {
      mockRepository.createDocument.mockResolvedValue(documentId);

      const result = await service.createResource(createInput, mockLogger);

      expect(result).toBe(documentId);
      expect(mockRepository.createDocument).toHaveBeenCalledWith(createInput, mockLogger);
    });

    it('should map repository error to domain service error when document not found', async () => {
      const repositoryError = new RepositoryError({
        code: RepositoryErrorCode.DOCUMENT_NOT_FOUND,
        message: 'Document not found',
      });
      mockRepository.createDocument.mockRejectedValue(repositoryError);

      await expect(service.createResource(createInput, mockLogger)).rejects.toThrow(DomainModelServiceError);
      await expect(service.createResource(createInput, mockLogger)).rejects.toMatchObject({
        code: DomainModelServiceErrorCode.RESOURCE_NOT_FOUND,
        message: 'Document not found',
      });
    });

    it('should map repository error to domain service error when related document not found', async () => {
      const repositoryError = new RepositoryError({
        code: RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND,
        message: 'Related document not found',
      });
      mockRepository.createDocument.mockRejectedValue(repositoryError);

      await expect(service.createResource(createInput, mockLogger)).rejects.toThrow(DomainModelServiceError);
      await expect(service.createResource(createInput, mockLogger)).rejects.toMatchObject({
        code: DomainModelServiceErrorCode.RELATED_RESOURCE_NOT_FOUND,
        message: 'Related document not found',
      });
    });

    it('should throw unexpected errors', async () => {
      const error = new Error('Unexpected error');
      mockRepository.createDocument.mockRejectedValue(error);

      await expect(service.createResource(createInput, mockLogger)).rejects.toThrow(error);
    });
  });

  describe(FinancialInstitutionsService.prototype.deleteResource.name, () => {
    const resourceId = 'fi-123';

    it('should delete a financial institution successfully', async () => {
      mockRepository.deleteDocument.mockResolvedValue();

      await service.deleteResource(resourceId, mockLogger);

      expect(mockRepository.deleteDocument).toHaveBeenCalledWith(resourceId, mockLogger);
    });

    it('should map repository error to domain service error when document not found', async () => {
      const repositoryError = new RepositoryError({
        code: RepositoryErrorCode.DOCUMENT_NOT_FOUND,
        message: 'Document not found',
      });
      mockRepository.deleteDocument.mockRejectedValue(repositoryError);

      await expect(service.deleteResource(resourceId, mockLogger)).rejects.toThrow(DomainModelServiceError);
      await expect(service.deleteResource(resourceId, mockLogger)).rejects.toMatchObject({
        code: DomainModelServiceErrorCode.RESOURCE_NOT_FOUND,
        message: 'Document not found',
      });
    });

    it('should throw unexpected errors', async () => {
      const error = new Error('Unexpected error');
      mockRepository.deleteDocument.mockRejectedValue(error);

      await expect(service.deleteResource(resourceId, mockLogger)).rejects.toThrow(error);
    });
  });

  describe(FinancialInstitutionsService.prototype.getResource.name, () => {
    const resourceId = 'fi-123';
    const mockDocument: FinancialInstitutionDocument = {
      id: resourceId,
      countryCode: 'US',
      name: 'Test Bank',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    };

    it('should get a financial institution successfully', async () => {
      mockRepository.getDocument.mockResolvedValue(mockDocument);

      const result = await service.getResource(resourceId, mockLogger);

      expect(result).toBeInstanceOf(FinancialInstitution);
      expect(result).toMatchObject({
        id: resourceId,
        countryCode: 'US',
        name: 'Test Bank',
      });
      expect(mockRepository.getDocument).toHaveBeenCalledWith(resourceId, mockLogger);
    });

    it('should return null when financial institution is not found', async () => {
      mockRepository.getDocument.mockResolvedValue(null);

      const result = await service.getResource(resourceId, mockLogger);

      expect(result).toBeNull();
    });
  });

  describe(FinancialInstitutionsService.prototype.getResourcesList.name, () => {
    const query: FilterFinancialInstitutionsInput = {
      countryCode: [{ value: 'US', operator: '==' }],
      name: [{ value: 'Bank', operator: '==' }],
    };
    const mockDocuments: FinancialInstitutionDocument[] = [
      {
        id: 'fi-1',
        countryCode: 'US',
        name: 'Test Bank 1',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
      {
        id: 'fi-2',
        countryCode: 'US',
        name: 'Test Bank 2',
        createdAt: new Date('2023-01-02'),
        updatedAt: new Date('2023-01-02'),
      },
    ];

    it('should get a list of financial institutions successfully', async () => {
      mockRepository.getDocumentsList.mockResolvedValue(mockDocuments);

      const result = await service.getResourcesList(query, mockLogger);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(FinancialInstitution);
      expect(result[1]).toBeInstanceOf(FinancialInstitution);
      expect(result[0]).toMatchObject({
        id: 'fi-1',
        countryCode: 'US',
        name: 'Test Bank 1',
      });
      expect(result[1]).toMatchObject({
        id: 'fi-2',
        countryCode: 'US',
        name: 'Test Bank 2',
      });
      expect(mockRepository.getDocumentsList).toHaveBeenCalledWith(query, mockLogger);
    });

    it('should return empty array when no financial institutions found', async () => {
      mockRepository.getDocumentsList.mockResolvedValue([]);

      const result = await service.getResourcesList(query, mockLogger);

      expect(result).toEqual([]);
    });
  });

  describe(FinancialInstitutionsService.prototype.updateResource.name, () => {
    const resourceId = 'fi-123';
    const updateInput: UpdateFinancialInstitutionInput = {
      name: 'Updated Bank Name',
    };

    it('should update a financial institution successfully', async () => {
      mockRepository.updateDocument.mockResolvedValue();

      await service.updateResource(resourceId, updateInput, mockLogger);

      expect(mockRepository.updateDocument).toHaveBeenCalledWith(resourceId, updateInput, mockLogger);
    });

    it('should map repository error to domain service error when document not found', async () => {
      const repositoryError = new RepositoryError({
        code: RepositoryErrorCode.DOCUMENT_NOT_FOUND,
        message: 'Document not found',
      });
      mockRepository.updateDocument.mockRejectedValue(repositoryError);

      await expect(service.updateResource(resourceId, updateInput, mockLogger)).rejects.toThrow(DomainModelServiceError);
      await expect(service.updateResource(resourceId, updateInput, mockLogger)).rejects.toMatchObject({
        code: DomainModelServiceErrorCode.RESOURCE_NOT_FOUND,
        message: 'Document not found',
      });
    });

    it('should map repository error to domain service error when related document not found', async () => {
      const repositoryError = new RepositoryError({
        code: RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND,
        message: 'Related document not found',
      });
      mockRepository.updateDocument.mockRejectedValue(repositoryError);

      await expect(service.updateResource(resourceId, updateInput, mockLogger)).rejects.toThrow(DomainModelServiceError);
      await expect(service.updateResource(resourceId, updateInput, mockLogger)).rejects.toMatchObject({
        code: DomainModelServiceErrorCode.RELATED_RESOURCE_NOT_FOUND,
        message: 'Related document not found',
      });
    });

    it('should throw error if the repository error is not known', async () => {
      const repositoryError = new RepositoryError({
        code: 'unknown-error' as RepositoryErrorCode,
        message: 'Unknown error',
      });
      mockRepository.updateDocument.mockRejectedValue(repositoryError);

      await expect(service.updateResource(resourceId, updateInput, mockLogger)).rejects.toThrow(repositoryError);
    });

    it('should throw unexpected errors', async () => {
      const error = new Error('Unexpected error');
      mockRepository.updateDocument.mockRejectedValue(error);

      await expect(service.updateResource(resourceId, updateInput, mockLogger)).rejects.toThrow(error);
    });

    it('should handle partial updates', async () => {
      const partialUpdateInput: UpdateFinancialInstitutionInput = {
        countryCode: 'CA',
      };
      mockRepository.updateDocument.mockResolvedValue();

      await service.updateResource(resourceId, partialUpdateInput, mockLogger);

      expect(mockRepository.updateDocument).toHaveBeenCalledWith(resourceId, partialUpdateInput, mockLogger);
    });
  });
}); 