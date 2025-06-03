import { ExecutionLogger } from '../../definitions';
import { UserCompanyRelation } from '../../domain';
import { InMemoryRepository } from '../../utils/repositories/in-memory-repository.class';
import { RepositoryError, RepositoryErrorCode } from '../../utils/repositories/repositories.errors';
import { CompaniesRepository } from '../companies/companies.repository';
import { UsersRepository } from '../users';
import { ERROR_MESSAGES, MOCK_USER_COMPANY_RELATIONS } from './user-company-relations.repository.constants';
import {
  CreateUserCompanyRelationInput,
  GetUserCompanyRelationsQuery,
  UpdateUserCompanyRelationInput,
} from './user-company-relations.repository.interfaces';


export class UserCompanyRelationsRepository extends InMemoryRepository<UserCompanyRelation, CreateUserCompanyRelationInput, UpdateUserCompanyRelationInput, GetUserCompanyRelationsQuery> {
  private static instance: UserCompanyRelationsRepository;

  public static getInstance(): UserCompanyRelationsRepository {
    if (!UserCompanyRelationsRepository.instance) {
      UserCompanyRelationsRepository.instance = new UserCompanyRelationsRepository(MOCK_USER_COMPANY_RELATIONS);
    }
    return UserCompanyRelationsRepository.instance;
  }

  /**
   * Creates a new user company relation
   * @param data - The data to create the new user company relation with
   * @param logger - Logger instance for tracking execution
   * @returns Promise resolving to the ID of the created user company relation
   * @throws RepositoryError with code {@link RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND} if the related user or company is not found
   */
  async createDocument(data: CreateUserCompanyRelationInput, logger: ExecutionLogger): Promise<string> {
    const { companyId } = data;
    const [user, company] = await  Promise.all([
      UsersRepository.getInstance().getDocument(data.userId, logger),
      CompaniesRepository.getInstance().getDocument(companyId, logger),
    ]);
    if (!user) {
      throw new RepositoryError({ code: RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND, message: ERROR_MESSAGES.USER_NOT_FOUND, data: { userId: data.userId } });
    }
    if (!company) {
      throw new RepositoryError({ code: RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND, message: ERROR_MESSAGES.COMPANY_NOT_FOUND, data: { companyId } });
    }
    return super.createDocument(data, logger);
  }
}
