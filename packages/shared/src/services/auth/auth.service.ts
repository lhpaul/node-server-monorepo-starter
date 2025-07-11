import { compare } from 'bcrypt';

import { ExecutionLogger } from '../../definitions';
import { PERMISSIONS_BY_ROLE, UserCompanyRole, User } from '../../domain';
import { SubscriptionsRepository, UserCompanyRelationsRepository, UsersRepository } from '../../repositories';
import { PERMISSION_SUFFIXES, STEPS } from './auth.service.constants';
import { UserPermissions, ValidateCredentialsInput } from './auth.service.interfaces';

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
    logger: ExecutionLogger,
  ): Promise<User | null> {
    const logGroup = `${this.constructor.name}.${this.validateCredentials.name}`;
    logger.startStep(STEPS.FIND_USER.id, logGroup);
    const [user, ..._users] = await UsersRepository.getInstance().getDocumentsList({
      email: [{ operator: '==', value: input.email }],
    }, logger);
    logger.endStep(STEPS.FIND_USER.id);
    if (!user) {
      return null;
    }
    logger.startStep(STEPS.CHECK_PASSWORD.id, logGroup);
    const isPasswordValid = await compare(input.password, user.currentPasswordHash);
    logger.endStep(STEPS.CHECK_PASSWORD.id);
    // normally here we would do something to avoid brute force attacks
    if (!isPasswordValid) {
      return null;
    }
    return user;
  }

  public async getUserPermissions(userId: string, logger: ExecutionLogger): Promise<UserPermissions> {
    const logGroup = `${this.constructor.name}.${this.getUserPermissions.name}`;
    logger.startStep(STEPS.GET_USER_COMPANY_RELATIONS.id, logGroup);
    const userCompanyRelations = await UserCompanyRelationsRepository.getInstance().getDocumentsList({
      userId: [{ operator: '==', value: userId }],
    }, logger).finally(() => logger.endStep(STEPS.GET_USER_COMPANY_RELATIONS.id));
    const response: UserPermissions = { companies: {} };
    // get subscriptions of this companies
    const now = new Date();
    logger.startStep(STEPS.GET_SUBSCRIPTIONS.id, logGroup);
    const companySubscriptions = await Promise.all(userCompanyRelations.map(async (relation) => {
      const subscriptions = await SubscriptionsRepository.getInstance().getDocumentsList({
        companyId: [{ operator: '==', value: relation.companyId }],
        startsAt: [{ operator: '<=', value: now }],
        endsAt: [{ operator: '>=', value: now }],
      }, logger);
      return subscriptions;
    })).finally(() => logger.endStep(STEPS.GET_SUBSCRIPTIONS.id));
    for (const index in userCompanyRelations) {
      const userCompanyRelation = userCompanyRelations[index];
      const subscriptions = companySubscriptions[index];
      response.companies[userCompanyRelation.companyId] = PERMISSIONS_BY_ROLE[userCompanyRelation.role as UserCompanyRole];
      if (!subscriptions.length) { // if no subscription, replace write permissions with read permissions
        response.companies[userCompanyRelation.companyId] = response.companies[userCompanyRelation.companyId].map((permission) => permission.replace(PERMISSION_SUFFIXES.WRITE, PERMISSION_SUFFIXES.READ));
      }
    }
    return response;
  }
  
}