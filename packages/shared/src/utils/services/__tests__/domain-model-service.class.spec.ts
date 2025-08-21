import { ExecutionLogger, FilterInput, FilterItem, QueryInput, QueryItem, Repository } from '../../../definitions';
import { FirestoreCollectionRepository, RepositoryError, RepositoryErrorCode } from '../../repositories';
import { DomainModelService } from '../domain-model-service.class';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '../domain-model-service.class.errors';

// Test interfaces
class TestDomainModel {
  id: string;
  name: string;

  constructor(data: Required<TestDomainModel>) {
    this.id = data.id;
    this.name = data.name;
  }
}

interface TestDocumentModel {
  id: string;
  name: string;
}

interface TestCreateResourceInput {
  name: string;
}

interface TestCreateDocumentInput {
  name: string;
}

interface TestUpdateResourceInput {
  name: string;
}

interface TestUpdateDocumentInput {
  name: string;
}

interface TestFilterResourcesInput extends FilterInput {
  name?: FilterItem<string>[];
}

interface TestDocumentsQueryInput extends QueryInput {
  name?: QueryItem<string>[];
}

describe(DomainModelService.name, () => {
  let service: DomainModelService<
    TestDomainModel,
    TestDocumentModel,
    TestCreateResourceInput,
    TestCreateDocumentInput,
    TestUpdateResourceInput,
    TestUpdateDocumentInput,
    TestFilterResourcesInput,
    TestDocumentsQueryInput
  >;
  let mockRepository: jest.Mocked<FirestoreCollectionRepository<TestDocumentModel, TestCreateDocumentInput, TestUpdateDocumentInput, TestDocumentsQueryInput>>;
  let mockLogger: jest.Mocked<ExecutionLogger>;

  beforeEach(() => {
    mockRepository = {
      createDocument: jest.fn(),
      createDocumentSync: jest.fn(),
      deleteDocument: jest.fn(),
      deleteDocumentSync: jest.fn(),
      getDocument: jest.fn(),
      getDocumentsList: jest.fn(),
      updateDocument: jest.fn(),
      updateDocumentSync: jest.fn(),
    } as any;

    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
      logError: jest.fn(),
    } as any;

    service = new DomainModelService(mockRepository, TestDomainModel);
  });

  describe(DomainModelService.prototype.createResource.name, () => {
    const createInput: TestCreateResourceInput = { name: 'test' };
    const documentId = '123';

    it('should create a resource successfully', async () => {
      mockRepository.createDocument.mockResolvedValue(documentId);

      const result = await service.createResource(createInput, mockLogger);

      expect(result).toBe(documentId);
      expect(mockRepository.createDocument).toHaveBeenCalledWith(createInput, mockLogger);
    });

    it('should map repository error to domain service error', async () => {
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

    it('should throw unexpected errors', async () => {
      const error = new Error('Unexpected error');
      mockRepository.createDocument.mockRejectedValue(error);

      await expect(service.createResource(createInput, mockLogger)).rejects.toThrow(error);
    });
  });

  describe(DomainModelService.prototype.deleteResource.name, () => {
    const resourceId = '123';

    it('should delete a resource successfully', async () => {
      mockRepository.deleteDocument.mockResolvedValue();

      await service.deleteResource(resourceId, mockLogger);

      expect(mockRepository.deleteDocument).toHaveBeenCalledWith(resourceId, mockLogger);
    });

    it('should map repository error to domain service error', async () => {
      const repositoryError = new RepositoryError({
        code: RepositoryErrorCode.DOCUMENT_NOT_FOUND,
        message: 'Document not found',
      });
      mockRepository.deleteDocument.mockRejectedValue(repositoryError);

      try {
        await service.deleteResource(resourceId, mockLogger);
        expect(false).toBe(true);
      } catch (error: any) {
        expect(error).toBeInstanceOf(DomainModelServiceError);
        expect(error.code).toBe(DomainModelServiceErrorCode.RESOURCE_NOT_FOUND);
      }
    });

    it('should throw unexpected errors', async () => {
      const error = new Error('Unexpected error');
      mockRepository.deleteDocument.mockRejectedValue(error);

      await expect(service.deleteResource(resourceId, mockLogger)).rejects.toThrow(error);
    });
  });

  describe(DomainModelService.prototype.getResource.name, () => {
    const resourceId = '123';
    const mockDocument: TestDocumentModel = {
      id: resourceId,
      name: 'test',
    };

    it('should get a resource successfully', async () => {
      mockRepository.getDocument.mockResolvedValue(mockDocument);

      const result = await service.getResource(resourceId, mockLogger);

      expect(result).toEqual(mockDocument);
      expect(mockRepository.getDocument).toHaveBeenCalledWith(resourceId, mockLogger);
    });

    it('should return null when resource is not found', async () => {
      mockRepository.getDocument.mockResolvedValue(null);

      const result = await service.getResource(resourceId, mockLogger);

      expect(result).toBeNull();
    });
  });

  describe(DomainModelService.prototype.getResourcesList.name, () => {
    const query: TestFilterResourcesInput = {
      name: [{ value: 'test', operator: '==' }],
    };
    const mockDocuments: TestDocumentModel[] = [
      { id: '1', name: 'test1' },
      { id: '2', name: 'test2' },
    ];

    it('should get a list of resources successfully', async () => {
      mockRepository.getDocumentsList.mockResolvedValue(mockDocuments);

      const result = await service.getResourcesList(query, mockLogger);

      expect(result).toEqual([
        { id: '1', name: 'test1' },
        { id: '2', name: 'test2' },
      ]);
      expect(mockRepository.getDocumentsList).toHaveBeenCalledWith(query, mockLogger);
    });
  });

  describe(DomainModelService.prototype.updateResource.name, () => {
    const resourceId = '123';
    const updateInput: TestUpdateResourceInput = { name: 'updated' };

    it('should update a resource successfully', async () => {
      mockRepository.updateDocument.mockResolvedValue();

      await service.updateResource(resourceId, updateInput, mockLogger);

      expect(mockRepository.updateDocument).toHaveBeenCalledWith(resourceId, updateInput, mockLogger);
    });

    it('should map repository error to domain service error', async () => {
      const repositoryError = new RepositoryError({
        code: RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND,
        message: 'Document not found',
      });
      mockRepository.updateDocument.mockRejectedValue(repositoryError);

      try {
        await service.updateResource(resourceId, updateInput, mockLogger);
        expect(false).toBe(true);
      } catch (error: any) {
        expect(error).toBeInstanceOf(DomainModelServiceError);
        expect(error.code).toBe(DomainModelServiceErrorCode.RELATED_RESOURCE_NOT_FOUND);
      }
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
  });
}); 