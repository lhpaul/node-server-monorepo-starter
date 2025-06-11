import { ExecutionLogger, FilterInput, QueryInput, Repository } from '../../definitions';
import { RepositoryError, RepositoryErrorCode } from '../repositories';
import { DomainModelServiceError, DomainModelServiceErrorCode } from './domain-model-service.class.errors';

export class DomainModelService<DomainModel, DocumentModel, CreateResourceInput, CreateDocumentInput, UpdateResourceInput, UpdateDocumentInput, FilterResourcesInput extends FilterInput, DocumentsQueryInput extends QueryInput> {
  
  protected repository: Repository<DocumentModel, CreateDocumentInput, UpdateDocumentInput, DocumentsQueryInput>;

  constructor(repository: Repository<DocumentModel, CreateDocumentInput, UpdateDocumentInput, DocumentsQueryInput>) {
    this.repository = repository;
  }

  /**
    * Create a new resource
    * @param data - The data to create the new resource with
    * @param logger - Logger instance for tracking execution
    * @returns Promise resolving to the ID of the created resource
    * @throws DomainModelServiceError with code {@link DomainModelServiceErrorCode.RELATED_RESOURCE_NOT_FOUND} if the resource is related to a not found resource
  */
  public createResource(data: CreateResourceInput, logger: ExecutionLogger): Promise<string> {
    return this.repository.createDocument(data as unknown as CreateDocumentInput, logger)
    .catch((error) => {
      if (error instanceof RepositoryError) {
        throw this._mapRepositoryErrorToDomainServiceError(error);
      }
      throw error;
    });
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
        throw this._mapRepositoryErrorToDomainServiceError(error);
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
    return this.repository.getDocument(id, logger).then((document) => this.mapDocumentToModel(document));
  }

  /**
    * Get a list of resources
    * @param query - The query to filter the resources
    * @param logger - Logger instance for tracking execution
    * @returns Promise resolving to the list of resources
  */
  public getResourcesList(query: FilterResourcesInput, logger: ExecutionLogger): Promise<DomainModel[]> {
    return this.repository.getDocumentsList(query as unknown as DocumentsQueryInput, logger).then((documents) => documents.map((document) => this.mapDocumentToModel(document) as DomainModel));
  }

  /**
    * Map a document to a domain model
    * @param document - The document to map
    * @returns The domain model
  */
  public mapDocumentToModel(document: DocumentModel | null): DomainModel | null {
    return document as unknown as DomainModel;
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
    return this.repository.updateDocument(id, data as unknown as UpdateDocumentInput, logger)
      .catch((error) => {
        if (error instanceof RepositoryError) {
          throw this._mapRepositoryErrorToDomainServiceError(error);
        }
        throw error;
      });
  }

  private _mapRepositoryErrorToDomainServiceError = (error: RepositoryError): DomainModelServiceError => {
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