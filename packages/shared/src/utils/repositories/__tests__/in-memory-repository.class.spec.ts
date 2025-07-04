import { ExecutionLogger, FilterInput, FilterItem } from '../../../definitions';
import { filterList } from '../../lists/lists.utils';
import { InMemoryRepository } from '../in-memory-repository.class';
import { STEPS } from '../in-memory-repository.class.constants';
import { RepositoryErrorCode } from '../repositories.errors';

jest.mock('../../time/time.utils', () => ({
  wait: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../lists/lists.utils', () => ({
  filterList: jest.fn().mockImplementation((list) => list),
}));

interface TestDocument {
  id: string;
  name: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TestCreateInput {
  name: string;
  age: number;
}

interface TestUpdateInput {
  name?: string;
  age?: number;
}

interface TestQueryInput extends FilterInput {
  name?: FilterItem<string>[];
  age?: FilterItem<number>[];
}

describe(InMemoryRepository.name, () => {
  let repository: InMemoryRepository<TestDocument, TestCreateInput, TestUpdateInput, TestQueryInput>;
  let mockLogger: ExecutionLogger;
  const initialDocuments: TestDocument[] = [
    {
      id: '0',
      name: 'John',
      age: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '1',
      name: 'Jane',
      age: 25,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    repository = new InMemoryRepository(initialDocuments);
    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
      lastStep: { id: '' },
      initTime: Date.now(),
      getStepElapsedTime: jest.fn(),
      getTotalElapsedTime: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      fatal: jest.fn(),
      trace: jest.fn(),
      silent: jest.fn(),
      level: 'info',
    } as unknown as ExecutionLogger;
  });

  describe(InMemoryRepository.prototype.createDocument.name, () => {
    const logGroup = `${InMemoryRepository.name}.${InMemoryRepository.prototype.createDocument.name}`;
    it('should create a new document and return its id', async () => {
      const createInput: TestCreateInput = { name: 'Alice', age: 28 };
      const id = await repository.createDocument(createInput, mockLogger);

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CREATE_DOCUMENT.id, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.CREATE_DOCUMENT.id);
      expect(id).toBe('2');
    });
  });

  describe(InMemoryRepository.prototype.deleteDocument.name, () => {
    const logGroup = `${InMemoryRepository.name}.${InMemoryRepository.prototype.deleteDocument.name}`;
    it('should delete an existing document', async () => {
      await repository.deleteDocument('0', mockLogger);

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_DOCUMENT.id, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.DELETE_DOCUMENT.id);
      const documents = await repository.getDocumentsList({}, mockLogger);
      expect(documents).toHaveLength(1);
      expect(documents[0].id).toBe('1');
    });

    it('should throw error when document not found', async () => {
      await expect(repository.deleteDocument('999', mockLogger)).rejects.toThrow();
      await expect(repository.deleteDocument('999', mockLogger)).rejects.toMatchObject({
        code: RepositoryErrorCode.DOCUMENT_NOT_FOUND,
      });
    });
  });

  describe(InMemoryRepository.prototype.getDocument.name, () => {
    const logGroup = `${InMemoryRepository.name}.${InMemoryRepository.prototype.getDocument.name}`;
    it('should return document when found', async () => {
      const document = await repository.getDocument('0', mockLogger);

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_DOCUMENT.id, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_DOCUMENT.id);
      expect(document).toEqual(initialDocuments[0]);
    });

    it('should return null when document not found', async () => {
      const document = await repository.getDocument('999', mockLogger);

      expect(document).toBeNull();
    });
  });

  describe(InMemoryRepository.prototype.getDocumentsList.name, () => {
    const logGroup = `${InMemoryRepository.name}.${InMemoryRepository.prototype.getDocumentsList.name}`;
    it('should return all documents when no query provided', async () => {
      const documents = await repository.getDocumentsList({}, mockLogger);

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_DOCUMENTS.id, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_DOCUMENTS.id);
      expect(filterList).not.toHaveBeenCalled();
      expect(documents).toEqual(initialDocuments);
    });

    it('should filter documents based on query', async () => {
      const query: TestQueryInput = {
        age: [{ value: 27, operator: '>' }],
      };
      await repository.getDocumentsList(query, mockLogger);

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_DOCUMENTS.id, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_DOCUMENTS.id);
      expect(filterList).toHaveBeenCalledTimes(1);
      expect(filterList).toHaveBeenCalledWith(expect.arrayContaining(initialDocuments) , 'age', { value: 27, operator: '>' });
    });
  });

  describe(InMemoryRepository.prototype.updateDocument.name, () => {
    const logGroup = `${InMemoryRepository.name}.${InMemoryRepository.prototype.updateDocument.name}`;
    it('should update an existing document', async () => {
      const updateInput: TestUpdateInput = { name: 'John Updated' };
      await repository.updateDocument('0', updateInput, mockLogger);

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_DOCUMENT.id, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_DOCUMENT.id);
      const document = await repository.getDocument('0', mockLogger);
      expect(document?.name).toBe('John Updated');
    });

    it('should throw error when document not found', async () => {
      const updateInput: TestUpdateInput = { name: 'Not Found' };
      await expect(repository.updateDocument('999', updateInput, mockLogger)).rejects.toThrow();
      await expect(repository.updateDocument('999', updateInput, mockLogger)).rejects.toMatchObject({
        code: RepositoryErrorCode.DOCUMENT_NOT_FOUND,
      });
    });
  });
});
