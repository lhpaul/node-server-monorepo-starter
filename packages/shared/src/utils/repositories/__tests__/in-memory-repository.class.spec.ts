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

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CREATE_DOCUMENT, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.CREATE_DOCUMENT);
      expect(id).toBe('2');
    });
  });

  describe(InMemoryRepository.prototype.deleteDocument.name, () => {
    const logGroup = `${InMemoryRepository.name}.${InMemoryRepository.prototype.deleteDocument.name}`;
    it('should delete an existing document', async () => {
      await repository.deleteDocument('0', mockLogger);

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_DOCUMENT, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.DELETE_DOCUMENT);
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

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_DOCUMENT, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_DOCUMENT);
      expect(document).toEqual(initialDocuments[0]);
    });

    it('should return null when document not found', async () => {
      const document = await repository.getDocument('999', mockLogger);

      expect(document).toBeNull();
    });
  });

  describe(InMemoryRepository.prototype.getDocumentsList.name, () => {
    const logGroup = `${InMemoryRepository.name}.${InMemoryRepository.prototype.getDocumentsList.name}`;
    
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return all documents when no query provided', async () => {
      const documents = await repository.getDocumentsList({}, mockLogger);

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_DOCUMENTS, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_DOCUMENTS);
      expect(filterList).not.toHaveBeenCalled();
      expect(documents).toEqual(initialDocuments);
    });

    it('should filter documents based on query', async () => {
      const query: TestQueryInput = {
        age: [{ value: 27, operator: '>' }],
      };
      await repository.getDocumentsList(query, mockLogger);

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_DOCUMENTS, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_DOCUMENTS);
      expect(filterList).toHaveBeenCalledTimes(1);
      expect(filterList).toHaveBeenCalledWith(expect.arrayContaining(initialDocuments) , 'age', { value: 27, operator: '>' });
    });

    it('should skip falsy query items (undefined)', async () => {
      const query: TestQueryInput = {
        name: undefined,
        age: [{ value: 25, operator: '==' }],
      };
      await repository.getDocumentsList(query, mockLogger);

      expect(filterList).toHaveBeenCalledTimes(1);
      expect(filterList).toHaveBeenCalledWith(expect.arrayContaining(initialDocuments), 'age', { value: 25, operator: '==' });
    });

    it('should skip falsy query items (null)', async () => {
      const query: TestQueryInput = {
        name: null as any,
        age: [{ value: 25, operator: '==' }],
      };
      await repository.getDocumentsList(query, mockLogger);

      expect(filterList).toHaveBeenCalledTimes(1);
      expect(filterList).toHaveBeenCalledWith(expect.arrayContaining(initialDocuments), 'age', { value: 25, operator: '==' });
    });

    it('should handle multiple query items for the same field', async () => {
      const query: TestQueryInput = {
        age: [
          { value: 25, operator: '>=' },
          { value: 35, operator: '<=' },
        ],
      };
      await repository.getDocumentsList(query, mockLogger);

      expect(filterList).toHaveBeenCalledTimes(2);
      expect(filterList).toHaveBeenNthCalledWith(1, expect.arrayContaining(initialDocuments), 'age', { value: 25, operator: '>=' });
      expect(filterList).toHaveBeenNthCalledWith(2, expect.arrayContaining(initialDocuments), 'age', { value: 35, operator: '<=' });
    });

    it('should handle multiple fields in query', async () => {
      const query: TestQueryInput = {
        name: [{ value: 'John', operator: '==' }],
        age: [{ value: 30, operator: '==' }],
      };
      await repository.getDocumentsList(query, mockLogger);

      expect(filterList).toHaveBeenCalledTimes(2);
      expect(filterList).toHaveBeenNthCalledWith(1, expect.arrayContaining(initialDocuments), 'name', { value: 'John', operator: '==' });
      expect(filterList).toHaveBeenNthCalledWith(2, expect.arrayContaining(initialDocuments), 'age', { value: 30, operator: '==' });
    });

    it('should handle mixed falsy and valid query items', async () => {
      const query: TestQueryInput = {
        name: undefined,
        age: [{ value: 25, operator: '==' }],
        nonExistentField: null as any,
      };
      await repository.getDocumentsList(query, mockLogger);

      expect(filterList).toHaveBeenCalledTimes(1);
      expect(filterList).toHaveBeenCalledWith(expect.arrayContaining(initialDocuments), 'age', { value: 25, operator: '==' });
    });

    it('should handle empty array query items', async () => {
      const query: TestQueryInput = {
        name: [],
        age: [{ value: 25, operator: '==' }],
      };
      await repository.getDocumentsList(query, mockLogger);

      expect(filterList).toHaveBeenCalledTimes(1);
      expect(filterList).toHaveBeenCalledWith(expect.arrayContaining(initialDocuments), 'age', { value: 25, operator: '==' });
    });

    it('should handle query with only falsy values', async () => {
      const query: TestQueryInput = {
        name: undefined,
        age: null as any,
      };
      const documents = await repository.getDocumentsList(query, mockLogger);

      expect(filterList).not.toHaveBeenCalled();
      expect(documents).toEqual(initialDocuments);
    });

    it('should handle complex query with multiple conditions', async () => {
      const query: TestQueryInput = {
        name: [
          { value: 'John', operator: '==' },
          { value: 'Jane', operator: '==' },
        ],
        age: [
          { value: 20, operator: '>=' },
          { value: 35, operator: '<=' },
        ],
      };
      await repository.getDocumentsList(query, mockLogger);

      expect(filterList).toHaveBeenCalledTimes(4);
      expect(filterList).toHaveBeenNthCalledWith(1, expect.arrayContaining(initialDocuments), 'name', { value: 'John', operator: '==' });
      expect(filterList).toHaveBeenNthCalledWith(2, expect.arrayContaining(initialDocuments), 'name', { value: 'Jane', operator: '==' });
      expect(filterList).toHaveBeenNthCalledWith(3, expect.arrayContaining(initialDocuments), 'age', { value: 20, operator: '>=' });
      expect(filterList).toHaveBeenNthCalledWith(4, expect.arrayContaining(initialDocuments), 'age', { value: 35, operator: '<=' });
    });

    it('should handle single query item (not array)', async () => {
      const query: TestQueryInput = {
        name: { value: 'John', operator: '==' } as any,
        age: { value: 30, operator: '==' } as any,
      };
      await repository.getDocumentsList(query, mockLogger);

      expect(filterList).toHaveBeenCalledTimes(2);
      expect(filterList).toHaveBeenNthCalledWith(1, expect.arrayContaining(initialDocuments), 'name', { value: 'John', operator: '==' });
      expect(filterList).toHaveBeenNthCalledWith(2, expect.arrayContaining(initialDocuments), 'age', { value: 30, operator: '==' });
    });
  });

  describe(InMemoryRepository.prototype.updateDocument.name, () => {
    const logGroup = `${InMemoryRepository.name}.${InMemoryRepository.prototype.updateDocument.name}`;
    it('should update an existing document', async () => {
      const updateInput: TestUpdateInput = { name: 'John Updated' };
      await repository.updateDocument('0', updateInput, mockLogger);

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_DOCUMENT, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_DOCUMENT);
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
