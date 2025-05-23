import { compare } from 'bcrypt';

import { ExecutionContext } from '../../definitions/executions.interfaces';
import { User } from '../../domain/models/user.model';
import { PERMISSIONS_BY_ROLE } from '../../domain/models/user-company-relation.model';
import { processLoggerMock } from '../../mocks/process-logger.mocks';
import { UserCompanyRelationsRepository } from '../../repositories/user-company-relations/user-company-relations.repository';
import { UsersRepository } from '../../repositories/users/users.repository';
import { UserPermissions, ValidateCredentialsInput } from './auth.service.interfaces';
import { STEPS } from './auth.service.constants';
export class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!this.instance) {
      this.instance = new AuthService();
    }
    return this.instance;
  }
  public async validateCredentials(
    input: ValidateCredentialsInput,
    context?: ExecutionContext,
  ): Promise<User | null> {
    const logger = context?.logger ?? processLoggerMock;
    logger.startStep(STEPS.FIND_USER.id);
    const [user, ..._users] = await UsersRepository.getInstance().getUsers({
      email: [{ operator: '==', value: input.email }],
    });
    logger.endStep(STEPS.FIND_USER.id);
    if (!user) {
      return null;
    }
    logger.startStep(STEPS.CHECK_PASSWORD.id);
    const isPasswordValid = await compare(input.password, user.currentPasswordHash);
    logger.endStep(STEPS.CHECK_PASSWORD.id);
    // normally here we would do something to avoid brute force attacks
    if (!isPasswordValid) {
      return null;
    }
    return user;
  }

  public async getUserPermissions(userId: string, context?: ExecutionContext): Promise<UserPermissions> {
    const logger = context?.logger ?? processLoggerMock;
    logger.startStep(STEPS.GET_USER_COMPANY_RELATIONS.id);
    const userCompanyRelations = await UserCompanyRelationsRepository.getInstance().getUserCompanyRelations({
      userId: [{ operator: '==', value: userId }],
    });
    logger.endStep(STEPS.GET_USER_COMPANY_RELATIONS.id);
    const response: UserPermissions = { companies: {} };
    for (const userCompanyRelation of userCompanyRelations) {
      response.companies[userCompanyRelation.companyId] = PERMISSIONS_BY_ROLE[userCompanyRelation.role];
    }
    return response;
  }
  
}