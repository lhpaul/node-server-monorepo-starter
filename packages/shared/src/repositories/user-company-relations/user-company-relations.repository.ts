import { ExecutionLogger } from '../../definitions';
import { FirestoreCollectionRepository, RepositoryError, RepositoryErrorCode } from '../../utils/repositories';
import { UsersRepository } from '../users/users.repository';
import { CompaniesRepository } from '../companies/companies.repository';
import {
  COLLECTION_PATH,
  ERROR_MESSAGES,
  STEPS,
} from './user-company-relations.repository.constants';
import {
  UserCompanyRelationDocument,
  CreateUserCompanyRelationDocumentInput,
  QueryUserCompanyRelationsInput,
  UpdateUserCompanyRelationDocumentInput,
} from './user-company-relations.repository.interfaces';


export class UserCompanyRelationsRepository extends FirestoreCollectionRepository<UserCompanyRelationDocument, CreateUserCompanyRelationDocumentInput, UpdateUserCompanyRelationDocumentInput, QueryUserCompanyRelationsInput> {
  static readonly COLLECTION_PATH = COLLECTION_PATH;
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

  async createDocument(data: CreateUserCompanyRelationDocumentInput, logger: ExecutionLogger): Promise<string> {
    const logGroup = `${this.constructor.name}.${this.createDocument.name}`;
    logger.startStep(STEPS.GET_RELATED_DOCUMENTS.id, logGroup);
    const { userId, companyId } = data;
    const [user, company] = await Promise.all([
      UsersRepository.getInstance().getDocument(userId, logger),
      CompaniesRepository.getInstance().getDocument(companyId, logger),
    ]).finally(() => logger.endStep(STEPS.GET_RELATED_DOCUMENTS.id));
    if (!user) {
      throw new RepositoryError({
        code: RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
        data: { userId },
      });
    }
    if (!company) {
      throw new RepositoryError({
        code: RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND,
        message: ERROR_MESSAGES.COMPANY_NOT_FOUND,
        data: { companyId },
      });
    }
    return super.createDocument(data, logger);
  }
} 
