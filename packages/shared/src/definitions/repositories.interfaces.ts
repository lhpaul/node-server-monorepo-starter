import { QueryInput } from './listing.interfaces';
import { ExecutionLogger } from './logging.interfaces';

/**
 * Generic repository interface that defines standard CRUD operations for a document-based data store.
 * @template DocumentModel - The type of document being stored and retrieved
 * @template CreateDocumentInput - The data structure required to create a new document
 * @template UpdateDocumentInput - The data structure used to update an existing document
 * @template FilterInput - The query parameters used to filter and list documents
 */
export interface Repository<DocumentModel, CreateDocumentInput, UpdateDocumentInput, FilterInput extends QueryInput> {

  /**
   * Creates a new document in the repository
   * @param data - The data to create the new document with
   * @param logger - Logger instance for tracking execution
   * @returns Promise resolving to the ID of the created document
   */
  createDocument(data: CreateDocumentInput, logger: ExecutionLogger): Promise<string>;

  /**
   * Deletes a document from the repository
   * @param documentId - The unique identifier of the document to delete
   * @param logger - Logger instance for tracking execution
   * @returns Promise resolving when the deletion is complete
   */
  deleteDocument(documentId: string, logger: ExecutionLogger): Promise<void>;
  
  /**
   * Retrieves a single document by its ID
   * @param documentId - The unique identifier of the document to retrieve
   * @param logger - Logger instance for tracking execution
   * @returns Promise resolving to the found document or null if not found
   */
  getDocument(documentId: string, logger: ExecutionLogger): Promise<DocumentModel | null>;

  /**
   * Retrieves a list of documents based on the provided query parameters
   * @param query - Query parameters to filter and sort the documents
   * @param logger - Logger instance for tracking execution
   * @returns Promise resolving to an array of matching documents
   */
  getDocumentsList(query: FilterInput, logger: ExecutionLogger): Promise<DocumentModel[]>;

  /**
   * Updates an existing document in the repository
   * @param documentId - The unique identifier of the document to update
   * @param data - The data to update the document with
   * @param logger - Logger instance for tracking execution
   * @returns Promise resolving when the update is complete
   */
  updateDocument(documentId: string, data: UpdateDocumentInput, logger: ExecutionLogger): Promise<void>;
}
