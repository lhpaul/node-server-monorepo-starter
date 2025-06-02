import { UserCompanyRelation } from '../../domain/models/user-company-relation.model';
import { FirestoreCollectionRepository } from '../../utils/firestore/firestore-collection-repository.class';
import { COLLECTION_PATH } from './user-company-relations.repository.constants';
import {
  CreateUserCompanyRelationInput,
  GetUserCompanyRelationsQuery,
  UpdateUserCompanyRelationInput,
} from './user-company-relations.repository.interfaces';

export class UserCompanyRelationsRepository extends FirestoreCollectionRepository<UserCompanyRelation, CreateUserCompanyRelationInput, UpdateUserCompanyRelationInput, GetUserCompanyRelationsQuery> {
  private static instance: UserCompanyRelationsRepository;

  public static getInstance(): UserCompanyRelationsRepository {
    if (!UserCompanyRelationsRepository.instance) {
      UserCompanyRelationsRepository.instance = new UserCompanyRelationsRepository();
    }
    return UserCompanyRelationsRepository.instance;
  }
  constructor() {
    super({
      collectionPath: COLLECTION_PATH
    });
  }
} 