import * as admin from 'firebase-admin';
import { FieldValue, OrderByDirection } from 'firebase-admin/firestore';
import { ExecutionLogger } from '../../definitions/logging.interfaces';
import { QueryInput as IQueryInput } from '../../definitions/listing.interfaces';
import { Repository } from '../../definitions/repositories.interfaces';
import { changeTimestampsToDate, runRetriableAction } from './firestore.utils';
import { CreateDocumentConfig, ParentIds, PrepareWriteOperationOutput, UpdateDocumentConfig } from './firestore-collection-repository.class.interfaces';
import { ERROR_MESSAGES, STEPS } from './firestore-collection-repository.class.constants';
import { REPOSITORY_ERROR_MESSAGES } from '../repositories/repositories.errors';
import { RepositoryErrorCode } from '../repositories/repositories.errors';
import { FIRESTORE_ERROR_CODE } from '../../constants/firestore.constants';
import { RepositoryError } from '../repositories/repositories.errors';

/**
 * A service class that provides CRUD operations for Firestore collections
 * @template DocumentModel - The type of document model
 * @template CreateDocumentInput - The type of input for creating a document
 * @template UpdateDocumentInput - The type of input for updating a document
 * @template QueryInput - The type of input for querying documents
 */
export class FirestoreCollectionRepository<DocumentModel, CreateDocumentInput, UpdateDocumentInput, QueryInput extends IQueryInput> implements Repository<DocumentModel, CreateDocumentInput, UpdateDocumentInput, QueryInput> {
  protected _db: FirebaseFirestore.Firestore;
  protected _childCollection?: string; // is the last collection in the path. E.g. "companies/:companyId/transactions" -> "transactions"
  protected _collectionPath: string; // is the full path to the collection. E.g. "companies/:companyId/transactions"
  protected _parentIdLabels?: string[]; // is the labels of the parent IDs. E.g. "companies/:companyId/transactions" -> ["companyId"]
  /**
   * Creates a new instance of FirestoreCollectionRepository
   * @param input - Configuration object for the repository
   * @param input.collectionPath - The path to the collection. Can be a simple collection path or a nested path with parent IDs (e.g., "companies/:companyId/transactions")
   * @param input.mapDocumentFromDb - Optional function to map Firestore document to the document model
   * @param input.onCreateMapDocumentBeforeSaving - Optional function to transform document data before saving on create
   * @param input.onCreateBeforeValidation - Optional function to perform validation before document creation
   * @param input.onUpdateBeforeValidation - Optional function to perform validation before document update
   * @param input.onDeleteBeforeValidation - Optional function to perform validation before document deletion
   * @throws {Error} If the collection path is invalid (parent ID labels must start with ":")
   */
  constructor(input: {
    collectionPath: string;
  }) {
    this._db = admin.firestore();
    this._collectionPath = input.collectionPath;
    if (this._collectionPath.includes('/')) {
      this._parentIdLabels = [];
      const pathLevels = this._collectionPath.split('/');
      for (let i = 1; i < pathLevels.length - 1; i += 2) { // we extract the ":parentId" labels. E.g. "companies/:companyId/transactions" -> ["companyId"]
        if (!pathLevels[i].startsWith(':')) {
          throw new Error(ERROR_MESSAGES.INVALID_COLLECTION_PATH(this._collectionPath));
        }
        this._parentIdLabels.push(pathLevels[i].slice(1)); // we remove the ":" from the label
      }
      this._childCollection = pathLevels[pathLevels.length - 1];
    }
  }

  /**
   * Creates a new document in the collection
   * @param data - The data to create the document with
   * @param logger - Logger instance for execution logging
   * @param config - Optional configuration for document creation
   * @param config.id - Optional custom document ID
   * @param config.parentIds - Optional parent collection IDs for nested collections
   * @returns Promise<string> - The ID of the created document
   * @throws {RepositoryError} with code RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND if the parent document does not exist.
   */
  public async createDocument(data: CreateDocumentInput, logger: ExecutionLogger, config?: CreateDocumentConfig): Promise<string> {
    const { documentRef, documentData } = this._prepareCreate(data, config);
    if (this._parentIdLabels) {
      // check if parent document exists
      const parentDocumentRef = (documentRef.parent.parent as FirebaseFirestore.DocumentReference);
      const parentDocumentSnapshot = await parentDocumentRef.get();
      if (!parentDocumentSnapshot.exists) {
        throw new RepositoryError({ code: RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND, message: REPOSITORY_ERROR_MESSAGES.RELATED_DOCUMENT_NOT_FOUND(parentDocumentRef.path) });
      }
    }
    logger.startStep(STEPS.CREATE_DOCUMENT.id);
    await runRetriableAction(() => {
      return documentRef.create(documentData)
    }, logger).finally(() => logger.endStep(STEPS.CREATE_DOCUMENT.id));
    logger.endStep(STEPS.CREATE_DOCUMENT.id);
    return this._buildCompoundId(documentRef);
  }

  /**
   * Adds create operation to a batch or transaction
   * @param data - The data to create the document with
   * @param batchOrTransaction - The batch or transaction to add the create operation to
   * @param logger - Logger instance for execution logging
   * @param config - Optional configuration for document creation
   * @param config.id - Optional custom document ID
   * @param config.parentIds - Optional parent collection IDs for nested collections
   */
  public createDocumentSync(data: CreateDocumentInput, batchOrTransaction: FirebaseFirestore.WriteBatch | FirebaseFirestore.Transaction, _logger: ExecutionLogger, config?: CreateDocumentConfig): void {
    const { documentRef, documentData } = this._prepareCreate(data, config);
    (batchOrTransaction as FirebaseFirestore.WriteBatch | FirebaseFirestore.Transaction).create(documentRef, documentData);
  }

  private _prepareCreate(data: CreateDocumentInput, config?: CreateDocumentConfig): PrepareWriteOperationOutput {
    const documentData = {
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };
    // we need to extract the parent ids in order to build the path
    let path: string;
    if (this._parentIdLabels) {
      const parentIdLabel = this._parentIdLabels[this._parentIdLabels.length - 1];
      if (!(data as any)[parentIdLabel]) {
        throw new Error(ERROR_MESSAGES.PARENT_ID_REQUIRED(parentIdLabel, this._collectionPath));
      }
      const parentCompoundId = (data as any)[parentIdLabel];
      const { documentId: parentDocumentId, parentIds: parentIdsFromParentCompoundId } = this._decodeCompoundId(parentCompoundId);
      path = this._getPath({
        [parentIdLabel]: parentDocumentId,
        ...parentIdsFromParentCompoundId
      });
      delete (documentData as any)[parentIdLabel]; // we delete the parentId from the data since it gets stored in the path instead of in the document data
    } else {
      path = this._getPath();
    }
    const documentRef = config?.id ? this._db.collection(path).doc(config.id) : this._db.collection(path).doc();
    return { documentRef, documentData };
  }

  /**
   * Deletes a document from the collection
   * @param id - The ID of the document to delete
   * @param logger - Logger instance for execution logging
   * @param config - Optional configuration for document deletion
   * @param config.parentIds - Optional parent collection IDs for nested collections
   * @returns Promise<void>
   */
  public async deleteDocument(id: string, logger: ExecutionLogger): Promise<void> {
    const { documentRef } = this._prepareDelete(id);
    logger.startStep(STEPS.DELETE_DOCUMENT.id);
    await runRetriableAction(() => documentRef.delete(), logger).finally(() => logger.endStep(STEPS.DELETE_DOCUMENT.id));
  }

  /**
   * Adds delete operation to a batch or transaction
   * @param documentId - The ID of the document to delete
   * @param batchOrTransaction - The batch or transaction to add the delete operation to
   * @param logger - Logger instance for execution logging
   * @param config - Optional configuration for document deletion
   * @param config.parentIds - Optional parent collection IDs for nested collections
   */
  public deleteDocumentSync(id: string, batchOrTransaction: FirebaseFirestore.WriteBatch | FirebaseFirestore.Transaction, _logger: ExecutionLogger): void {
    const { documentRef } = this._prepareDelete(id);
    (batchOrTransaction as FirebaseFirestore.WriteBatch | FirebaseFirestore.Transaction).delete(documentRef);
  }

  private _prepareDelete(id: string): { documentRef: FirebaseFirestore.DocumentReference } {
    const { documentId, parentIds } = this._decodeCompoundId(id);
    const path = this._getPath(parentIds);
    const documentRef = this._db.collection(path).doc(documentId);
    return { documentRef };
  }

  /**
   * Retrieves a single document from the collection
   * @param id - The ID of the document to retrieve
   * @param _logger - Logger instance for execution logging
   * @param config - Optional configuration for document retrieval
   * @param config.parentIds - Optional parent collection IDs for nested collections
   * @param config.transaction - Optional Firestore transaction for transaction operations
   * @returns Promise<DocumentModel | null> - The retrieved document or null if not found
   */
  public async getDocument(id: string, _logger: ExecutionLogger, config?: {
    transaction?: FirebaseFirestore.Transaction;
  }): Promise<DocumentModel | null> {
    const { documentId, parentIds } = this._decodeCompoundId(id);
    const path = this._getPath(parentIds);
    const documentRef = this._db.collection(path).doc(documentId);
    _logger.startStep(STEPS.GET_DOCUMENT.id);
    const documentSnapshot = config?.transaction ?
      await config.transaction.get(documentRef).finally(() => _logger.endStep(STEPS.GET_DOCUMENT.id)) :
      await documentRef.get().finally(() => _logger.endStep(STEPS.GET_DOCUMENT.id));
    if (!documentSnapshot.exists) {
      return null;
    }
    const parsedDocument = this._parseDocument(documentSnapshot);
    return parsedDocument;
  }

  /**
   * Retrieves a list of documents from the collection based on query parameters
   * @param query - The query parameters to filter documents
   * @param _logger - Logger instance for execution logging
   * @param config - Optional configuration for document retrieval
   * @param config.limit - Optional limit for the number of documents to retrieve
   * @param config.offset - Optional offset for pagination
   * @param config.orderBy - Optional ordering configuration
   * @param config.parentIds - Optional parent collection IDs for nested collections
   * @param config.transaction - Optional Firestore transaction for transaction operations
   * @returns Promise<DocumentModel[]> - Array of retrieved documents
   */
  public async getDocumentsList(query: QueryInput, _logger: ExecutionLogger, config?: {
    limit?: number;
    offset?: number;
    orderBy?: { field: string; direction: OrderByDirection; };
    parentIds?: ParentIds;
    transaction?: FirebaseFirestore.Transaction;
  }): Promise<DocumentModel[]> {
    let queryRef: FirebaseFirestore.Query;
    const modifiedQuery = { ...query };
    const parentIds = { ...config?.parentIds };
    if (this._parentIdLabels) {
      for (const parentIdLabel of this._parentIdLabels) {
        if (query[parentIdLabel]) {
          delete modifiedQuery[parentIdLabel];
          parentIds[parentIdLabel] = typeof(query[parentIdLabel]) === 'object' ? Array.isArray(query[parentIdLabel]) ? query[parentIdLabel][0].value : query[parentIdLabel].value : query[parentIdLabel];
        }
      }
    }
    if (this._childCollection && !Object.keys(parentIds).length) { // this is for when querying in all sub-collections
      queryRef = this._db.collectionGroup(this._childCollection);
    } else {
      queryRef = this._db.collection(this._getPath(parentIds));
    }
    for (const [field, queryFieldConfig] of Object.entries(modifiedQuery)) {
      if (Array.isArray(queryFieldConfig)) {
        for (const queryFieldConfigItem of queryFieldConfig) {
          queryRef = queryRef.where(field, queryFieldConfigItem.operator, queryFieldConfigItem.value);
        }
      } else if (queryFieldConfig && typeof(queryFieldConfig) === 'object') {
        queryRef = queryRef.where(field, queryFieldConfig.operator, queryFieldConfig.value);
      } else {
        queryRef.where(field, '==', queryFieldConfig);
      }
    }
    if (config?.orderBy) {
      queryRef = queryRef.orderBy(config.orderBy.field, config.orderBy.direction);
    }
    if (config?.offset) {
      queryRef = queryRef.offset(config?.offset);
    }
    if (config?.limit) {
      queryRef = queryRef.limit(config?.limit);
    }
    _logger.startStep(STEPS.GET_DOCUMENTS.id);
    const documentQuerySnapshot = config?.transaction ?
      await config.transaction.get(queryRef).finally(() => _logger.endStep(STEPS.GET_DOCUMENTS.id)) :
      await queryRef.get().finally(() => _logger.endStep(STEPS.GET_DOCUMENTS.id));
    return documentQuerySnapshot.docs.map((documentSnapshot) => {
      const parsedDocument = this._parseDocument(documentSnapshot);
      return parsedDocument;
    });
  }

  /**
   * Updates an existing document in the collection
   * @param id - The ID of the document to update
   * @param updateData - The data to update the document with
   * @param logger - Logger instance for execution logging
   * @param config - Optional configuration for document update
   * @param config.ignoreTimestamp - Optional flag to ignore updating the timestamp
   * @param config.parentIds - Optional parent collection IDs for nested collections
   * @returns Promise<void>
   * @throws {RepositoryError} with code RepositoryErrorCode.DOCUMENT_NOT_FOUND if the document is not found
   */
  public async updateDocument(id: string, updateData: UpdateDocumentInput, logger: ExecutionLogger, config?: UpdateDocumentConfig): Promise<void> {
    const { documentRef, documentData } = this._prepareUpdate(id, updateData, config);
    logger.startStep(STEPS.UPDATE_DOCUMENT.id);
    await runRetriableAction(() => documentRef.update(documentData), logger)
    .finally(() => logger.endStep(STEPS.UPDATE_DOCUMENT.id))
    .catch((error) => {
      if (error.code === FIRESTORE_ERROR_CODE.NOT_FOUND) {
        throw new RepositoryError({ code: RepositoryErrorCode.DOCUMENT_NOT_FOUND, message: REPOSITORY_ERROR_MESSAGES.DOCUMENT_NOT_FOUND(id) });
      }
      throw error;
    });
  }

  /**
   * Adds update operation to a batch or transaction
   * @param id - The ID of the document to update
   * @param updateData - The data to update the document with
   * @param batchOrTransaction - The batch or transaction to add the update operation to
   * @param logger - Logger instance for execution logging
   * @param config - Optional configuration for document update
   * @param config.ignoreTimestamp - Optional flag to ignore updating the timestamp
   * @param config.parentIds - Optional parent collection IDs for nested collections
   * @returns void
   */
  public updateDocumentSync(id: string, updateData: UpdateDocumentInput, batchOrTransaction: FirebaseFirestore.WriteBatch | FirebaseFirestore.Transaction, logger: ExecutionLogger, config?: UpdateDocumentConfig): void {
    const { documentRef, documentData } = this._prepareUpdate(id, updateData, config);
    (batchOrTransaction as FirebaseFirestore.WriteBatch).update(documentRef, documentData); // the "as FirebaseFirestore.WriteBatch" is needed for some strange typescript error
  }

  private _prepareUpdate(id: string, updateData: UpdateDocumentInput, config?: UpdateDocumentConfig): PrepareWriteOperationOutput {
    const { documentId, parentIds } = this._decodeCompoundId(id);
    const path = this._getPath(parentIds);
    const documentRef = this._db.collection(path).doc(documentId);
    const finalConfig = {
      ignoreTimestamp: false,
      ...config
    };
    return {
      documentRef,
      documentData: {
        ...updateData,
        ...(!finalConfig.ignoreTimestamp && { updatedAt: FieldValue.serverTimestamp() })
      }
    };
  }

  /**
   * Parses a Firestore document snapshot into the document model. Here we add the parentId field and its value, merge the ids of the document and its parent documents, and change the timestamps to Date objects
   * @param documentSnapshot - The Firestore document snapshot to parse
   * @returns DocumentModel - The parsed document model
   * @private
   */
  private _parseDocument(documentSnapshot: FirebaseFirestore.DocumentSnapshot): DocumentModel {
    const output = { id: this._buildCompoundId(documentSnapshot.ref), ...changeTimestampsToDate(documentSnapshot.data()) } as unknown as DocumentModel;
    if (this._parentIdLabels) {
      const parentId = documentSnapshot.ref.parent.parent?.id as string;
      const parentIdLabel = this._parentIdLabels[this._parentIdLabels.length - 1];
      (output as any)[parentIdLabel] = parentId;
      (output as any).id = this._buildCompoundId(documentSnapshot.ref);
    }
    return output;
  }

  /**
   * Builds the compound ID of the document. By compound ID we mean the ID that contains all the parent IDs and the document ID.
   * @param documentRef - The Firestore document snapshot to build the compound ID from
   * @returns string - The compound ID of the document
   * @throws {Error} If the document has no parent IDs but the collection has parent IDs
   */
  private _buildCompoundId(documentRef: FirebaseFirestore.DocumentReference): string {
    let id = documentRef.id;
    let parentRef: FirebaseFirestore.DocumentReference | null = documentRef;
    if (this._parentIdLabels) {
      for (const _ of this._parentIdLabels) {
        parentRef = parentRef.parent?.parent as FirebaseFirestore.DocumentReference;
        id = `${parentRef.id}-${id}`;
      }
    }
    return id;
  }

  /**
   * Decodes the compound ID into the document ID and the parent IDs. A compound ID is an ID that contains all the parent IDs and the document ID.
   * @param id - The ID to decode
   * @returns { documentId: string, parentIds: {[parentIdLabel: string]: string} } - The decoded ID
   * @throws {Error} If the ID is invalid
   * @private
   */
  private _decodeCompoundId(id: string): { documentId: string, parentIds: ParentIds } {
    const ids = id.split('-');
    const parentIds: {[parentIdLabel: string]: string} = {};
    if (this._parentIdLabels) {
      for (let index = 0; index < this._parentIdLabels.length; index++) {
        parentIds[this._parentIdLabels[index]] = ids[index];
      }
    }
    return { documentId: ids[ids.length - 1], parentIds };
  }

  /**
   * Gets the collection path with parent IDs resolved
   * @param parentIds - The parent IDs
   * @returns string - The resolved collection path
   * @throws {Error} If parentIds are required but not provided
   * @private
   */
  private _getPath(parentIds?: ParentIds): string {
    let path = this._collectionPath;
    if (this._parentIdLabels) {
      for (let index = 0; index < this._parentIdLabels.length; index++) {
        if (!parentIds?.[this._parentIdLabels[index]]) {
          throw new Error(ERROR_MESSAGES.PARENT_IDS_REQUIRED(this._collectionPath));
        }
        path = path.replace(`:${this._parentIdLabels[index]}`, parentIds[this._parentIdLabels[index]]);
      }
    }
    return path;
  }
}