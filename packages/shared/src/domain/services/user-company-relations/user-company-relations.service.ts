// Internal modules (farthest path first, then alphabetical)
import { ExecutionLogger } from '../../../definitions';
import { UserCompanyRelation, UserCompanyRole } from '../../entities/user-company-relation.model';
import {
  UserCompanyRelationsRepository,
  UserCompanyRelationDocument,
  CreateUserCompanyRelationDocumentInput,
  QueryUserCompanyRelationsInput,
  UpdateUserCompanyRelationDocumentInput,
} from '../../../repositories';
import { DomainModelService } from '../../../utils/services';

// Local imports (alphabetical)
import {
  CreateUserCompanyRelationInput,
  FilterUserCompanyRelationsInput,
  UpdateUserCompanyRelationInput,
} from './user-company-relations.service.interfaces';

export class UserCompanyRelationsService extends DomainModelService<UserCompanyRelation, UserCompanyRelationDocument, CreateUserCompanyRelationInput, CreateUserCompanyRelationDocumentInput, UpdateUserCompanyRelationInput, UpdateUserCompanyRelationDocumentInput, FilterUserCompanyRelationsInput, QueryUserCompanyRelationsInput> {
  private static instance: UserCompanyRelationsService;

  public static getInstance(): UserCompanyRelationsService {
    if (!this.instance) {
      this.instance = new UserCompanyRelationsService(UserCompanyRelationsRepository.getInstance(), UserCompanyRelation as any);
    }
    return this.instance;
  }

  /**
   * Get a resource with proper type conversion
   * @param id - The ID of the resource to get
   * @param logger - Logger instance for tracking execution
   * @returns Promise resolving to the resource or null if the resource is not found
   */
  public getResource(id: string, logger: ExecutionLogger): Promise<UserCompanyRelation | null> {
    return this.repository.getDocument(id, logger).then((document) => {
      if (!document) return null;
      return new UserCompanyRelation({
        ...document,
        role: document.role as UserCompanyRole,
      });
    });
  }

  /**
   * Get a list of resources with proper type conversion
   * @param query - The query to filter the resources
   * @param logger - Logger instance for tracking execution
   * @returns Promise resolving to the list of resources
   */
  public getResourcesList(query: FilterUserCompanyRelationsInput, logger: ExecutionLogger): Promise<UserCompanyRelation[]> {
    return this.repository.getDocumentsList(query as unknown as QueryUserCompanyRelationsInput, logger).then((documents) => 
      documents.map((document) => new UserCompanyRelation({
        ...document,
        role: document.role as UserCompanyRole,
      }))
    );
  }

  public getUserCompanyRelations(userId: string, logger: ExecutionLogger): Promise<UserCompanyRelation[]> {
    return this.getResourcesList({
      userId: [{ operator: '==', value: userId }],
    }, logger);
  }
}
