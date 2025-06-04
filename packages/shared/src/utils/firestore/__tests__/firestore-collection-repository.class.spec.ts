import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { FirestoreCollectionRepository } from '../firestore-collection-repository.class';
import { ExecutionLogger } from '../../../definitions/logging.interfaces';
import { QueryInput, QueryItem } from '../../../definitions/listing.interfaces';
import { RepositoryError, RepositoryErrorCode } from '../../../utils/repositories/repositories.errors';
import { FIRESTORE_ERROR_CODE } from '../../../constants/firestore.constants';
import { ERROR_MESSAGES, STEPS } from '../firestore-collection-repository.class.constants';
import { changeTimestampsToDate, runRetriableAction } from '..';
import { OrderByDirection } from '../firestore-collection-repository.class.interfaces';

// Mock Firebase Admin
jest.mock('firebase-admin', () => {
  return {
    firestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
          get: jest.fn(),
          parent: {
            parent: {
              id: 'parentId'
            }
          }
        })),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        get: jest.fn()
      })),
      collectionGroup: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        get: jest.fn()
      }))
    }))
  };
});
jest.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    serverTimestamp: jest.fn(() => 'serverTimestamp')
  }
}));
jest.mock('../../../utils/firestore/firestore.utils', () => ({
  changeTimestampsToDate: jest.fn(),
  runRetriableAction: jest.fn(),
  runRetriableTransaction: jest.fn(),
}));

describe(FirestoreCollectionRepository.name, () => {
  const mockServerTimestamp = 'serverTimestamp';
  const mainCollectionName = 'mainCollection';
  const subCollection = 'childCollection';
  const subCollectionPath = `${mainCollectionName}/:${mainCollectionName}Id/${subCollection}`;
  let mainDocumentRefMock: any;
  let subCollectionDocumentRefMock: any;
  let repository: FirestoreCollectionRepository<any, any, any, any>;
  let mockLogger: ExecutionLogger;
  
  let mainCollectionRefMock: any;
  let subCollectionRefMock: any;


  beforeEach(() => {
    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
      warn: jest.fn(),
    } as unknown as ExecutionLogger;

    mainDocumentRefMock = {
      id: 'test-id',
      create: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({}),
        ref: mainDocumentRefMock
      }),
    };
  
    subCollectionDocumentRefMock = {
      ...mainDocumentRefMock,
      id: 'sub-collection-document-id',
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({}),
        ref: subCollectionDocumentRefMock
      }),
      parent: {
        parent: mainDocumentRefMock
      }
    };

    mainCollectionRefMock = {
      doc: jest.fn(() => mainDocumentRefMock),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: []
      })
    };
    subCollectionRefMock = {
      doc: jest.fn(() => subCollectionDocumentRefMock),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: []
      })
    };
    jest.spyOn(admin, 'firestore').mockImplementation(() => {
      return {
        collection: jest.fn().mockImplementation((path: string) => {
          if (path.includes(subCollection)) {
            return subCollectionRefMock;
          }
          return mainCollectionRefMock;
        }),
        collectionGroup: jest.fn().mockReturnValue(subCollectionRefMock)
      } as unknown as FirebaseFirestore.Firestore;
    });

    jest.mocked(FieldValue.serverTimestamp).mockImplementation(() => mockServerTimestamp as unknown as FieldValue);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error when its a sub-collection and one or more of parentIds are not provided with the correct format', () => {
    expect(() => new FirestoreCollectionRepository({
      collectionPath: 'parent/parentId/child',
    })).toThrow();
  });

  describe(FirestoreCollectionRepository.prototype.createDocument.name, () => {
    describe('when the collection is not a sub-collection', () => {
      beforeEach(() => {
        repository = new FirestoreCollectionRepository({
          collectionPath: mainCollectionName
        });
      });

      it('should create a document successfully', async () => {
        const data = { name: 'Test' };
        mainDocumentRefMock.create.mockResolvedValueOnce(undefined);
        jest.mocked(runRetriableAction).mockImplementation(async (actionFn: (...args: any[]) => any) => actionFn());
  
        const result = await repository.createDocument(data, mockLogger);
  
        expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CREATE_DOCUMENT.id);
        expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.CREATE_DOCUMENT.id);
        expect(mainDocumentRefMock.create).toHaveBeenCalledWith({
          ...data,
          createdAt: mockServerTimestamp,
          updatedAt: mockServerTimestamp
        });
        expect(result).toEqual(mainDocumentRefMock.id);
      });
  
      it('should create a document with custom ID', async () => {
        const data = { name: 'Test' };
        const customId = 'custom-id';
        mainDocumentRefMock.create.mockResolvedValueOnce(undefined);
  
        await repository.createDocument(data, mockLogger, { id: customId });
  
        expect(mainCollectionRefMock.doc).toHaveBeenCalledWith(customId);
      });
    });

    describe('when the collection is a sub-collection', () => {
      const createData = { name: 'Test', [`${mainCollectionName}Id`]: 'parentId' };
      beforeEach(() => {
        
        repository = new FirestoreCollectionRepository({
          collectionPath: subCollectionPath
        });
        
      });

      it('should throw an error when the parentId does not come in the createData', async () => {
        try {
          await repository.createDocument({ name: 'Test' }, mockLogger);
        } catch (error: any) {
          expect(error).toBeInstanceOf(Error);
        }
      });

      it('should throw repository error when the parent does not exist', async () => {
        mainDocumentRefMock.get.mockResolvedValueOnce({
          exists: false,
        });
        try {
          await repository.createDocument({ name: 'Test', [`${mainCollectionName}Id`]: 'non-existent-parent-id' }, mockLogger);
          expect(true).toBe(false);
        } catch (error: any) {
          expect(error).toBeInstanceOf(RepositoryError);
          expect(error.code).toBe(RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND);
        }
      });

      it('should create a document successfully', async () => {
        mainDocumentRefMock.get.mockResolvedValueOnce({
          exists: true,
          data: () => ({}),
          ref: mainDocumentRefMock
        });
        subCollectionDocumentRefMock.create.mockResolvedValueOnce(undefined);
        jest.mocked(runRetriableAction).mockImplementation(async (actionFn: (...args: any[]) => any) => actionFn());
  
        const result = await repository.createDocument(createData, mockLogger);
  
        expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CREATE_DOCUMENT.id);
        expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.CREATE_DOCUMENT.id);
        expect(mainDocumentRefMock.create).toHaveBeenCalledWith({
          name: createData.name,
          createdAt: mockServerTimestamp,
          updatedAt: mockServerTimestamp
        });
        expect(result).toEqual(`${mainDocumentRefMock.id}-${subCollectionDocumentRefMock.id}`);
      });
  
      it('should create a document with custom ID', async () => {
        const customId = 'custom-id';
        mainDocumentRefMock.get.mockResolvedValueOnce({
          exists: true,
          data: () => ({}),
          ref: mainDocumentRefMock
        });
        mainDocumentRefMock.create.mockResolvedValueOnce(undefined);
  
        await repository.createDocument(createData, mockLogger, { id: customId });
  
        expect(subCollectionRefMock.doc).toHaveBeenCalledWith(customId);
      });
    });
  });

  describe(FirestoreCollectionRepository.prototype.createDocumentSync.name, () => {
    describe('when the collection is not a sub-collection', () => {
      beforeEach(() => {
        repository = new FirestoreCollectionRepository({
          collectionPath: mainCollectionName
        });
      });
      describe('when using a batch', () => {
        it('should create a document successfully', () => {
          const data = { name: 'Test' };
          const batch = { create: jest.fn() } as unknown as FirebaseFirestore.WriteBatch;
          repository.createDocumentSync(data, batch, mockLogger);
  
          expect(batch.create).toHaveBeenCalledWith(mainDocumentRefMock, {
            name: data.name,
            createdAt: mockServerTimestamp,
            updatedAt: mockServerTimestamp
          });
        });
      });
      describe('when using a transaction', () => {
        it('should create a document successfully', () => {
          const data = { name: 'Test' };
          const transaction = { create: jest.fn() } as unknown as FirebaseFirestore.Transaction;
          repository.createDocumentSync(data, transaction, mockLogger);
        });
      });
    });
    describe('when the collection is a sub-collection', () => {
      const createData = { name: 'Test', [`${mainCollectionName}Id`]: 'parentId' };
      beforeEach(() => {
        repository = new FirestoreCollectionRepository({
          collectionPath: subCollectionPath
        });
      });
      describe('when using a batch', () => {
        it('should create a document successfully', () => {
          
          const batch = { create: jest.fn() } as unknown as FirebaseFirestore.WriteBatch;
          repository.createDocumentSync(createData, batch, mockLogger);

          expect(batch.create).toHaveBeenCalledWith(subCollectionDocumentRefMock, {
            name: createData.name,
            createdAt: mockServerTimestamp,
            updatedAt: mockServerTimestamp
          });
        });
      });
      describe('when using a transaction', () => {
        it('should create a document successfully', () => {
          const transaction = { create: jest.fn() } as unknown as FirebaseFirestore.Transaction;
          repository.createDocumentSync(createData, transaction, mockLogger);

          expect(transaction.create).toHaveBeenCalledWith(subCollectionDocumentRefMock, {
            name: createData.name,
            createdAt: mockServerTimestamp,
            updatedAt: mockServerTimestamp
          });
        });
      });
    });
  });

  describe(FirestoreCollectionRepository.prototype.deleteDocument.name, () => {
    describe('when the collection is not a sub-collection', () => {
      beforeEach(() => {
        repository = new FirestoreCollectionRepository({
          collectionPath: mainCollectionName
        });
      });
      it('should delete a document successfully', async () => {
        mainDocumentRefMock.delete.mockResolvedValueOnce(undefined);

        await repository.deleteDocument('test-id', mockLogger);

        expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_DOCUMENT.id);
        expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.DELETE_DOCUMENT.id);
        expect(mainDocumentRefMock.delete).toHaveBeenCalled();
      });
    });
    describe('when the collection is a sub-collection', () => {
      beforeEach(() => {
        repository = new FirestoreCollectionRepository({
          collectionPath: subCollectionPath
        });
      });
      it('should delete a document successfully', async () => {
        subCollectionDocumentRefMock.delete.mockResolvedValueOnce(undefined);

        await repository.deleteDocument('test-id', mockLogger);

        expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_DOCUMENT.id);
        expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.DELETE_DOCUMENT.id);
        expect(subCollectionDocumentRefMock.delete).toHaveBeenCalled();
      });
    });
  });

  describe(FirestoreCollectionRepository.prototype.deleteDocumentSync.name, () => {
    describe('when the collection is not a sub-collection', () => {
      beforeEach(() => {
        repository = new FirestoreCollectionRepository({
          collectionPath: mainCollectionName
        });
      });
      describe('when using a batch', () => {
        it('should delete a document successfully', () => {
          const batch = { delete: jest.fn() } as unknown as FirebaseFirestore.WriteBatch;
          repository.deleteDocumentSync('test-id', batch, mockLogger);

          expect(batch.delete).toHaveBeenCalledWith(mainDocumentRefMock);
        });
      });
      describe('when using a transaction', () => {
        it('should delete a document successfully', () => {
          const transaction = { delete: jest.fn() } as unknown as FirebaseFirestore.Transaction;
          repository.deleteDocumentSync('test-id', transaction, mockLogger);

          expect(transaction.delete).toHaveBeenCalledWith(mainDocumentRefMock);
        });
      });
    });
    describe('when the collection is a sub-collection', () => {
      beforeEach(() => {
        repository = new FirestoreCollectionRepository({
          collectionPath: subCollectionPath
        });
      });
      describe('when using a batch', () => {
        it('should delete a document successfully', () => {
          const batch = { delete: jest.fn() } as unknown as FirebaseFirestore.WriteBatch;
          repository.deleteDocumentSync('test-id', batch, mockLogger);

          expect(batch.delete).toHaveBeenCalledWith(subCollectionDocumentRefMock);
        });
      });
      describe('when using a transaction', () => {
        it('should delete a document successfully', () => {
          const transaction = { delete: jest.fn() } as unknown as FirebaseFirestore.Transaction;
          repository.deleteDocumentSync('test-id', transaction, mockLogger);

          expect(transaction.delete).toHaveBeenCalledWith(subCollectionDocumentRefMock);
        });
      });
    });
  });

  describe(FirestoreCollectionRepository.prototype.getDocument.name, () => {
    describe('when the collection is not a sub-collection', () => {
      beforeEach(() => {
        repository = new FirestoreCollectionRepository({
          collectionPath: mainCollectionName
        });
      });
      it('should retrieve a document successfully', async () => {
        const mockData = { name: 'Test' };
        mainDocumentRefMock.get.mockResolvedValueOnce({
          exists: true,
          data: () => mockData,
          ref: mainDocumentRefMock
        });
        jest.mocked(changeTimestampsToDate).mockImplementation((data: any) => data);
  
        const result = await repository.getDocument('test-id', mockLogger);
  
        expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_DOCUMENT.id);
        expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_DOCUMENT.id);
        expect(result).toEqual({
          id: mainDocumentRefMock.id,
          ...mockData,
        });
      });
      describe('when using a transaction', () => {
        const mockData = { name: 'Test' };
        it('should retrieve a document successfully', async () => {
          const transaction = { get: jest.fn().mockResolvedValueOnce({
            exists: true,
            data: () => mockData,
            ref: mainDocumentRefMock
          }) } as unknown as FirebaseFirestore.Transaction;
          jest.mocked(changeTimestampsToDate).mockImplementation((data: any) => data);

          const result = await repository.getDocument('test-id', mockLogger, { transaction });

          expect(transaction.get).toHaveBeenCalledWith(mainDocumentRefMock);
          expect(result).toEqual({
            id: mainDocumentRefMock.id,
            ...mockData,
          });
        });
      });
  
      it('should return null when document does not exist', async () => {
        mainDocumentRefMock.get.mockResolvedValueOnce({
          exists: false
        });
  
        const result = await repository.getDocument('test-id', mockLogger);
  
        expect(result).toBeNull();
      });
    });
    describe('when the collection is a sub-collection', () => {
      beforeEach(() => {
        repository = new FirestoreCollectionRepository({
          collectionPath: subCollectionPath
        });
      });
      it('should retrieve a document successfully', async () => {
        const mockData = { name: 'Test' };
        subCollectionDocumentRefMock.get.mockResolvedValueOnce({
          exists: true,
          data: () => mockData,
          ref: subCollectionDocumentRefMock
        });
        jest.mocked(changeTimestampsToDate).mockImplementation((data: any) => data);
  
        const result = await repository.getDocument('test-id', mockLogger);
  
        expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_DOCUMENT.id);
        expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_DOCUMENT.id);
        expect(result).toEqual({
          id: `${mainDocumentRefMock.id}-${subCollectionDocumentRefMock.id}`,
          ...mockData,
          [`${mainCollectionName}Id`]: mainDocumentRefMock.id,
        });
      });
      describe('when using a transaction', () => {
        it('should retrieve a document successfully', async () => {
          const mockData = { name: 'Test' };
          const transaction = { get: jest.fn().mockResolvedValueOnce({
            exists: true,
            data: () => mockData,
            ref: subCollectionDocumentRefMock
          }) } as unknown as FirebaseFirestore.Transaction;
          jest.mocked(changeTimestampsToDate).mockImplementation((data: any) => data);
  
          const result = await repository.getDocument('test-id', mockLogger, { transaction });
  
          expect(transaction.get).toHaveBeenCalledWith(subCollectionDocumentRefMock);
          expect(result).toEqual({
            id: `${mainDocumentRefMock.id}-${subCollectionDocumentRefMock.id}`,
            ...mockData,
            [`${mainCollectionName}Id`]: mainDocumentRefMock.id,
          });
        });
      });
    });
  });

  describe(FirestoreCollectionRepository.prototype.getDocumentsList.name, () => {
    describe('when the collection is not a sub-collection', () => {
      beforeEach(() => {
        repository = new FirestoreCollectionRepository({
          collectionPath: mainCollectionName
        });
      });
      it('should retrieve a list of documents with query parameters', async () => {
        const query: QueryInput = {
          name: 'Test'
        };
        const mockDocs = [
          {
            data: () => ({ name: 'Test1', createdAt: 'timestamp' }),
            ref: mainDocumentRefMock
          },
          {
            data: () => ({ name: 'Test2', createdAt: 'timestamp' }),
            ref: mainDocumentRefMock
          }
        ];
        mainCollectionRefMock.get.mockResolvedValueOnce({
          docs: mockDocs
        });
  
        const result = await repository.getDocumentsList(query, mockLogger);
  
        expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_DOCUMENTS.id);
        expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_DOCUMENTS.id);
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual(expect.objectContaining({
          id: expect.any(String),
          name: 'Test1'
        }));
      });
  
      it('should apply limit, offset and orderBy to query', async () => {
        const query: QueryInput = {};
        const config = {
          limit: 10,
          offset: 5,
          orderBy: {
            field: 'createdAt',
            direction: OrderByDirection.DESC
          }
        };
  
        await repository.getDocumentsList(query, mockLogger, config);
  
        expect(mainCollectionRefMock.limit).toHaveBeenCalledWith(config.limit);
        expect(mainCollectionRefMock.offset).toHaveBeenCalledWith(config.offset);
        expect(mainCollectionRefMock.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      });
      describe('when using a transaction', () => {
        it('should retrieve a list of documents with query parameters', async () => {
          const query: QueryInput = {
            name: 'Test'
          };
          const mockDocs = [
            {
              data: () => ({ name: 'Test1', createdAt: 'timestamp' }),
              ref: mainDocumentRefMock
            },
          ];
          const transaction = { get: jest.fn().mockResolvedValueOnce({
            docs: mockDocs
          }) } as unknown as FirebaseFirestore.Transaction;
          const config = {
            limit: 10,
            offset: 5,
            transaction: transaction
          };
          jest.mocked(changeTimestampsToDate).mockImplementation((data: any) => data);

          const result = await repository.getDocumentsList(query, mockLogger, config);

          expect(mainCollectionRefMock.limit).toHaveBeenCalledWith(config.limit);
          expect(mainCollectionRefMock.offset).toHaveBeenCalledWith(config.offset);
          expect(transaction.get).toHaveBeenCalledWith(mainCollectionRefMock);
          expect(result).toHaveLength(1);
          expect(result[0]).toEqual({
            id: mainDocumentRefMock.id,
            ...mockDocs[0].data()
          });
        });
      });
    });
    describe('when the collection is a sub-collection', () => {
      beforeEach(() => {
        repository = new FirestoreCollectionRepository({
          collectionPath: subCollectionPath
        });
      });
      it('should retrieve a list of documents with query parameters', async () => {
        const query: QueryInput = {
          name: 'Test',
          [`${mainCollectionName}Id`]: mainDocumentRefMock.id,
          field1: { value: 'value1', operator: '==' },
          field2: [{ value: 'value2', operator: '==' }]
        };
        const mockDocs = [
          {
            data: () => ({ name: 'Test1', createdAt: 'timestamp' }),
            ref: subCollectionDocumentRefMock
          },
          {
            data: () => ({ name: 'Test2', createdAt: 'timestamp' }),
            ref: subCollectionDocumentRefMock
          }
        ];
        subCollectionRefMock.get.mockResolvedValueOnce({
          docs: mockDocs
        });
        jest.mocked(changeTimestampsToDate).mockImplementation((data: any) => data);

        const result = await repository.getDocumentsList(query, mockLogger);

        expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_DOCUMENTS.id);
        expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_DOCUMENTS.id);
        expect(subCollectionRefMock.where).toHaveBeenCalledTimes(3);
        expect(subCollectionRefMock.where).toHaveBeenCalledWith('name', '==', query.name);
        expect(subCollectionRefMock.where).toHaveBeenCalledWith('field1', '==', (query.field1 as QueryItem<any>).value);
        expect(subCollectionRefMock.where).toHaveBeenCalledWith('field2', '==', (query.field2 as QueryItem<any>[])[0].value);
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
          id: `${mainDocumentRefMock.id}-${subCollectionDocumentRefMock.id}`,
          [`${mainCollectionName}Id`]: mainDocumentRefMock.id,
          ...mockDocs[0].data()
        });
      });
      it('should apply limit, offset and orderBy to query', async () => {
        const query: QueryInput = {};
        const config = {
          limit: 10,
          offset: 5,
          orderBy: {
            field: 'createdAt',
            direction: OrderByDirection.DESC
          }
        };
        await repository.getDocumentsList(query, mockLogger, config);

        expect(subCollectionRefMock.limit).toHaveBeenCalledWith(config.limit);
        expect(subCollectionRefMock.offset).toHaveBeenCalledWith(config.offset);
        expect(subCollectionRefMock.orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      });
      describe('when parentId query is provided with an object', () => {
        it('should construct the where clause correctly if it comes as a query input', async () => {
          const query: QueryInput = {
            name: 'Test',
            [`${mainCollectionName}Id`]: { value: mainDocumentRefMock.id, operator: '==' }
          };
          const mockDocs = [
            {
              data: () => ({ name: 'Test1', createdAt: 'timestamp' }),
              ref: subCollectionDocumentRefMock
            },
          ];
          subCollectionRefMock.get.mockResolvedValueOnce({
            docs: mockDocs
          });

          await repository.getDocumentsList(query, mockLogger);

          expect(subCollectionRefMock.where).toHaveBeenCalledWith('name', '==', query.name);
        });
        it('should construct the where clause correctly if it comes as an array of query inputs', async () => {
          const query: QueryInput = {
            name: 'Test',
            [`${mainCollectionName}Id`]: [{ value: mainDocumentRefMock.id, operator: '==' }]
          };
          const mockDocs = [
            {
              data: () => ({ name: 'Test1', createdAt: 'timestamp' }),
              ref: subCollectionDocumentRefMock
            },
          ];
          subCollectionRefMock.get.mockResolvedValueOnce({
            docs: mockDocs
          });

          await repository.getDocumentsList(query, mockLogger);

          expect(subCollectionRefMock.where).toHaveBeenCalledWith('name', '==', query.name);
        });
      });
      describe('when using a transaction', () => {
        it('should retrieve a list of documents with query parameters', async () => {
          const query: QueryInput = {
            name: 'Test'
          };
          const mockDocs = [
            {
              data: () => ({ name: 'Test1', createdAt: 'timestamp' }),
              ref: subCollectionDocumentRefMock
            },
          ];
          const transaction = { get: jest.fn().mockResolvedValueOnce({
            docs: mockDocs
          }) } as unknown as FirebaseFirestore.Transaction;
          const config = {
            limit: 10,
            offset: 5,
            transaction: transaction
          };
          jest.mocked(changeTimestampsToDate).mockImplementation((data: any) => data);

          const result = await repository.getDocumentsList(query, mockLogger, config);

          expect(transaction.get).toHaveBeenCalledWith(subCollectionRefMock);
          expect(subCollectionRefMock.limit).toHaveBeenCalledWith(config.limit);
          expect(subCollectionRefMock.offset).toHaveBeenCalledWith(config.offset);
          expect(result).toHaveLength(1);
          expect(result[0]).toEqual({
            id: `${mainDocumentRefMock.id}-${subCollectionDocumentRefMock.id}`,
            [`${mainCollectionName}Id`]: mainDocumentRefMock.id,
            ...mockDocs[0].data()
          });
        });
      });
    });
  });

  describe(FirestoreCollectionRepository.prototype.updateDocument.name, () => {
    describe('when the collection is not a sub-collection', () => {
      beforeEach(() => {
        repository = new FirestoreCollectionRepository({
          collectionPath: mainCollectionName
        });
      });
      it('should update a document successfully', async () => {
        const updateData = { name: 'Updated' };
        mainDocumentRefMock.update.mockResolvedValueOnce(undefined);
  
        await repository.updateDocument('test-id', updateData, mockLogger);
  
        expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_DOCUMENT.id);
        expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_DOCUMENT.id);
        expect(mainDocumentRefMock.update).toHaveBeenCalledWith({
          ...updateData,
          updatedAt: mockServerTimestamp
        });
      });
  
      it('should throw error when document not found', async () => {
        const updateData = { name: 'Updated' };
        mainDocumentRefMock.update.mockRejectedValueOnce({
          code: FIRESTORE_ERROR_CODE.NOT_FOUND
        });
  
        await expect(repository.updateDocument('test-id', updateData, mockLogger))
          .rejects
          .toMatchObject({
            code: RepositoryErrorCode.DOCUMENT_NOT_FOUND
          });
      });
      it('should throw unknown error when the update fails', async () => {
        const updateData = { name: 'Updated' };
        const error = new Error('Unknown error');
        mainDocumentRefMock.update.mockRejectedValueOnce(error);

        await expect(repository.updateDocument('test-id', updateData, mockLogger))
          .rejects
          .toThrow(error);
      });
    });
    
    describe('when the collection is a sub-collection', () => {
      beforeEach(() => {
        repository = new FirestoreCollectionRepository({
          collectionPath: subCollectionPath
        });
      });

      it('should update a document successfully', async () => {
        const updateData = { name: 'Updated' };
        subCollectionDocumentRefMock.update.mockResolvedValueOnce(undefined);
  
        await repository.updateDocument('test-id', updateData, mockLogger);

        expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_DOCUMENT.id);
        expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_DOCUMENT.id);
        expect(subCollectionDocumentRefMock.update).toHaveBeenCalledWith({
          ...updateData,
          updatedAt: mockServerTimestamp
        });
      });
      it('should throw error when document not found', async () => {
        const updateData = { name: 'Updated' };
        subCollectionDocumentRefMock.update.mockRejectedValueOnce({
          code: FIRESTORE_ERROR_CODE.NOT_FOUND
        });

        await expect(repository.updateDocument('test-id', updateData, mockLogger))
          .rejects
          .toMatchObject({
            code: RepositoryErrorCode.DOCUMENT_NOT_FOUND
          });
      });
      it('should throw unknown error when the update fails', async () => {
        const updateData = { name: 'Updated' };
        const error = new Error('Unknown error');
        subCollectionDocumentRefMock.update.mockRejectedValueOnce(error);

        await expect(repository.updateDocument('test-id', updateData, mockLogger))
          .rejects
          .toThrow(error);
      });
    });
    describe('when the collection is a sub-collection of a sub-collection', () => {
      const subSubCollection = 'subSubCollection';
      const subSubCollectionPath = `${mainCollectionName}/:${mainCollectionName}Id/${subCollection}/:${subCollection}Id/${subSubCollection}`;
      let subSubCollectionDocumentRefMock: any;
      let subSubCollectionRefMock: any;
      beforeEach(() => {
        subSubCollectionDocumentRefMock = {
          ...subCollectionDocumentRefMock,
          id: 'sub-sub-collection-document-id',
        };
        subSubCollectionRefMock = {
          ...subCollectionRefMock,
          doc: jest.fn(() => subSubCollectionDocumentRefMock),
        };
        repository = new FirestoreCollectionRepository({
          collectionPath: subSubCollectionPath
        });
      });
      it('should throw error when the id is not correctly composed', async () => {
        const updateData = { name: 'Updated' };
        try {
          await repository.updateDocument('testId', updateData, mockLogger);
          expect(true).toBe(false);
        } catch (error: any) {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toBe(ERROR_MESSAGES.PARENT_IDS_REQUIRED(subSubCollectionPath));
        }
      });
    });
  });

  describe(FirestoreCollectionRepository.prototype.updateDocumentSync.name, () => {
    describe('when the collection is not a sub-collection', () => {
      beforeEach(() => {
        repository = new FirestoreCollectionRepository({
          collectionPath: mainCollectionName
        });
      });
      describe('when using a batch', () => {
        it('should update a document successfully', () => {
          const updateData = { name: 'Updated' };
          const batch = { update: jest.fn() } as unknown as FirebaseFirestore.WriteBatch;
          repository.updateDocumentSync('test-id', updateData, batch, mockLogger);

          expect(batch.update).toHaveBeenCalledWith(mainDocumentRefMock, {
            ...updateData,
            updatedAt: mockServerTimestamp
          });
        });
      });
      describe('when using a transaction', () => {
        it('should update a document successfully', () => {
          const updateData = { name: 'Updated' };
          const transaction = { update: jest.fn() } as unknown as FirebaseFirestore.Transaction;
          repository.updateDocumentSync('test-id', updateData, transaction, mockLogger);

          expect(transaction.update).toHaveBeenCalledWith(mainDocumentRefMock, {
            ...updateData,
            updatedAt: mockServerTimestamp
          });
        });
      });
    });
    describe('when the collection is a sub-collection', () => {
      beforeEach(() => {
        repository = new FirestoreCollectionRepository({
          collectionPath: subCollectionPath
        });
      });
      describe('when using a batch', () => {
        it('should update a document successfully', () => {
          const updateData = { name: 'Updated' };
          const batch = { update: jest.fn() } as unknown as FirebaseFirestore.WriteBatch;
          repository.updateDocumentSync('test-id', updateData, batch, mockLogger);

          expect(batch.update).toHaveBeenCalledWith(subCollectionDocumentRefMock, {
            ...updateData,
            updatedAt: mockServerTimestamp
          });
        });
      });
      describe('when using a transaction', () => {
        it('should update a document successfully', () => {
          const updateData = { name: 'Updated' };
          const transaction = { update: jest.fn() } as unknown as FirebaseFirestore.Transaction;
          repository.updateDocumentSync('test-id', updateData, transaction, mockLogger);

          expect(transaction.update).toHaveBeenCalledWith(subCollectionDocumentRefMock, {
            ...updateData,
            updatedAt: mockServerTimestamp
          });
        });
      });
    });
  });
});
