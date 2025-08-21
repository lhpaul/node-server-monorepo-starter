// Internal modules (farthest path first, then alphabetical)
import { ExecutionLogger, FilterInput, QueryInput } from '../../definitions';
import { FirestoreCollectionRepository, RepositoryError, RepositoryErrorCode } from '../repositories';

// Local imports (alphabetical)
import { DomainModelServiceError, DomainModelServiceErrorCode } from './domain-model-service.class.errors';

export class DomainModelService<DomainModel, DocumentModel, CreateResourceInput, CreateDocumentInput, UpdateResourceInput, UpdateDocumentInput, FilterResourcesInput extends FilterInput, DocumentsQueryInput extends QueryInput> {
  protected DocumentToModelClass: new (data: DocumentModel) => DomainModel;
  
  protected repository: FirestoreCollectionRepository<DocumentModel, CreateDocumentInput, UpdateDocumentInput, DocumentsQueryInput>;

  constructor(
    repository: FirestoreCollectionRepository<DocumentModel, CreateDocumentInput, UpdateDocumentInput, DocumentsQueryInput>,
    documentToModelClass: new (data: DocumentModel) => DomainModel,
  ) {
    this.repository = repository;
    this.DocumentToModelClass = documentToModelClass;
  }

  /**
    * Create a new resource
    * @param data - The data to create the new resource with
    * @param logger - Logger instance for tracking execution
    * @returns Promise resolving to the ID of the created resource
    * @throws DomainModelServiceError with code {@link DomainModelServiceErrorCode.RELATED_RESOURCE_NOT_FOUND} if the resource is related to a not found resource
  */
  public createResource(data: CreateResourceInput, logger: ExecutionLogger): Promise<string> {
    return this.repository.createDocument(this._beforeCreateDataParse(data), logger)
    .catch((error) => {
      if (error instanceof RepositoryError) {
        throw this._mapRepositoryErrorToDomainModelServiceError(error);
      }
      throw error;
    });
  }

  /**
   * This method is meant to be overridden by the child class to parse the data to the document model in case it is needed
   * @param data - The create data to be parsed to the document model
   * @returns The create data parsed to the document model
   */
  protected _beforeCreateDataParse(data: CreateResourceInput): CreateDocumentInput {
    return data as unknown as CreateDocumentInput;
  }

  /**
    * Delete a resource
    * @param id - The ID of the resource to delete
    * @param logger - Logger instance for tracking execution
    * @returns Promise resolving to void
  */
  public deleteResource(id: string, logger: ExecutionLogger): Promise<void> {
    return this.repository.deleteDocument(id, logger)
    .catch((error) => {
      if (error instanceof RepositoryError) {
        throw this._mapRepositoryErrorToDomainModelServiceError(error);
      }
      throw error;
    });
  }

  /**
    * Get a resource
    * @param id - The ID of the resource to get
    * @param logger - Logger instance for tracking execution
    * @returns Promise resolving to the resource or null if the resource is not found
  */
  public getResource(id: string, logger: ExecutionLogger): Promise<DomainModel | null> {
    return this.repository.getDocument(id, logger).then((document) => document ? new this.DocumentToModelClass(document) : null);
  }

  /**
    * Get a list of resources
    * @param query - The query to filter the resources
    * @param logger - Logger instance for tracking execution
    * @returns Promise resolving to the list of resources
  */
  public getResourcesList(query: FilterResourcesInput, logger: ExecutionLogger): Promise<DomainModel[]> {
    return this.repository.getDocumentsList(query as unknown as DocumentsQueryInput, logger).then((documents) => documents.map((document) => new this.DocumentToModelClass(document)));
  }

  /**
    * Update a resource
    * @param id - The ID of the resource to update
    * @param data - The data to update the resource with
    * @param logger - Logger instance for tracking execution
    * @returns Promise resolving to void
    * @throws DomainModelServiceError with code {@link DomainModelServiceErrorCode.RESOURCE_NOT_FOUND} if the resource is not found
    * @throws DomainModelServiceError with code {@link DomainModelServiceErrorCode.RELATED_RESOURCE_NOT_FOUND} if the resource is related to a not found resource
  */
  public updateResource(id: string, data: UpdateResourceInput, logger: ExecutionLogger): Promise<void> {
    return this.repository.updateDocument(id, this._beforeUpdateDataParse(data), logger)
      .catch((error) => {
        if (error instanceof RepositoryError) {
          throw this._mapRepositoryErrorToDomainModelServiceError(error);
        }
        throw error;
      });
  }

  /**
   * This method is meant to be overridden by the child class to parse the data to the document model in case it is needed
   * @param data - The update data to be parsed to the document model
   * @returns The update data parsed to the document model
   */
  protected _beforeUpdateDataParse(data: UpdateResourceInput): UpdateDocumentInput {
    return data as unknown as UpdateDocumentInput;
  }

  private _mapRepositoryErrorToDomainModelServiceError(error: RepositoryError): DomainModelServiceError {
    switch (error.code) {
      case RepositoryErrorCode.DOCUMENT_NOT_FOUND:
        return new DomainModelServiceError({
          code: DomainModelServiceErrorCode.RESOURCE_NOT_FOUND,
          message: error.message,
        });
      case RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND:
        return new DomainModelServiceError({
          code: DomainModelServiceErrorCode.RELATED_RESOURCE_NOT_FOUND,
          message: error.message,
        });
      default:
        throw error;
    }
  };
}