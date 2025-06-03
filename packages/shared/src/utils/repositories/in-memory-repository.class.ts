import { DatabaseObject, ExecutionLogger, QueryInput, QueryItem, Repository } from '../../definitions';
import { filterList } from '../lists/lists.utils';
import { wait } from '../time/time.utils';
import { IN_MEMORY_REPOSITORY_WAIT_TIME, STEPS } from './in-memory-repository.class.constants';
import { RepositoryErrorCode, REPOSITORY_ERROR_MESSAGES, RepositoryError } from './repositories.errors';

/**
 * Generic repository class that defines standard CRUD operations for a document-based data store.
 * This class is designed to be used in memory, and is not suitable for production use.
 * 
 * @template DocumentModel - The type of document being stored and retrieved
 * @template CreateDocumentInput - The data structure required to create a new document
 * @template UpdateDocumentInput - The data structure used to update an existing document
 * @template FilterInput - The query parameters used to filter and list documents
 */
export class InMemoryRepository<DocumentModel extends DatabaseObject, CreateDocumentInput, UpdateDocumentInput, FilterInput extends QueryInput> implements Repository<DocumentModel, CreateDocumentInput, UpdateDocumentInput, QueryInput> {
  private _documents: DocumentModel[] = [];

  constructor(documents: DocumentModel[]) {
    this._documents = [...documents];
  }

  /**
   * Creates a new document in the repository
   * @param data - The data to create the new document with
   * @param logger - Logger instance for tracking execution
   * @returns Promise resolving to the ID of the created document
   */
  public async createDocument(data: CreateDocumentInput, logger: ExecutionLogger): Promise<string> {
    logger.startStep(STEPS.CREATE_DOCUMENT.id);
    await wait(IN_MEMORY_REPOSITORY_WAIT_TIME);
    const id = this._documents.length.toString();
    this._documents.push({
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as DocumentModel);
    logger.endStep(STEPS.CREATE_DOCUMENT.id);
    return Promise.resolve(id);
  }

  /**
   * Deletes a document from the repository
   * @param documentId - The unique identifier of the document to delete
   * @param logger - Logger instance for tracking execution
   * @returns Promise resolving when the deletion is complete
   * @throws RepositoryError with code {@link RepositoryErrorCode.DOCUMENT_NOT_FOUND} if the document is not found
   */
  public async deleteDocument(id: string, logger: ExecutionLogger): Promise<void> {
    logger.startStep(STEPS.DELETE_DOCUMENT.id);
    await wait(IN_MEMORY_REPOSITORY_WAIT_TIME);
    const index = this._documents.findIndex((d) => d.id === id);
    if (index !== -1) {
      this._documents.splice(index, 1);
    } else {
      throw new RepositoryError({
        code: RepositoryErrorCode.DOCUMENT_NOT_FOUND,
        message: REPOSITORY_ERROR_MESSAGES.DOCUMENT_NOT_FOUND(id),
      });
    }
    logger.endStep(STEPS.DELETE_DOCUMENT.id);
    return Promise.resolve();
  }

  /**
   * Retrieves a single document by its ID
   * @param documentId - The unique identifier of the document to retrieve
   * @param logger - Logger instance for tracking execution
   * @returns Promise resolving to the found document or null if not found
   */
  public async getDocument(id: string, logger: ExecutionLogger): Promise<DocumentModel | null> {
    logger.startStep(STEPS.GET_DOCUMENT.id);
    await wait(IN_MEMORY_REPOSITORY_WAIT_TIME);
    const document = this._documents.find((d) => d.id === id) ?? null;
    logger.endStep(STEPS.GET_DOCUMENT.id);
    return Promise.resolve(document);
  }

  /**
   * Retrieves a list of documents based on the provided query parameters
   * @param query - Query parameters to filter and sort the documents
   * @param logger - Logger instance for tracking execution
   * @returns Promise resolving to an array of matching documents
   */
  public async getDocumentsList(query: FilterInput, logger: ExecutionLogger): Promise<DocumentModel[]> {
    logger.startStep(STEPS.GET_DOCUMENTS.id);
    await wait(IN_MEMORY_REPOSITORY_WAIT_TIME);
    logger.endStep(STEPS.GET_DOCUMENTS.id);
    let filteredItems = [...this._documents];
    for (const key in query) {
      const queries = query[
        key as keyof FilterInput
      ] as QueryItem<any>[];
      filteredItems = queries.reduce(
        (acc, query) => filterList(acc, key, query),
        filteredItems,
      );
    }
    return Promise.resolve(filteredItems);
  }

  /**
   * Updates an existing document in the repository
   * @param documentId - The unique identifier of the document to update
   * @param data - The data to update the document with
   * @param logger - Logger instance for tracking execution
   * @returns Promise resolving when the update is complete
   * @throws RepositoryError with code {@link RepositoryErrorCode.DOCUMENT_NOT_FOUND} if the document is not found
   */
  public async updateDocument(id: string, data: UpdateDocumentInput, logger: ExecutionLogger): Promise<void> {
    logger.startStep(STEPS.UPDATE_DOCUMENT.id);
    await wait(IN_MEMORY_REPOSITORY_WAIT_TIME);
    const index = this._documents.findIndex((d) => d.id === id);
    if (index !== -1) {
      this._documents[index] = { ...this._documents[index], ...data };
    } else {
      throw new RepositoryError({
        code: RepositoryErrorCode.DOCUMENT_NOT_FOUND,
        message: REPOSITORY_ERROR_MESSAGES.DOCUMENT_NOT_FOUND(id),
      });
    }
    logger.endStep(STEPS.UPDATE_DOCUMENT.id);
    return Promise.resolve();
  }
}