import { FirestoreCollectionRepository } from '../../utils/repositories';
import { COLLECTION_PATH } from './user-company-relations.repository.constants';
import {
  UserCompanyRelationDocument,
  CreateUserCompanyRelationDocumentInput,
  QueryUserCompanyRelationsInput,
  UpdateUserCompanyRelationDocumentInput,
} from './user-company-relations.repository.interfaces';


export class UserCompanyRelationsRepository extends FirestoreCollectionRepository<UserCompanyRelationDocument, CreateUserCompanyRelationDocumentInput, UpdateUserCompanyRelationDocumentInput, QueryUserCompanyRelationsInput> {
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
