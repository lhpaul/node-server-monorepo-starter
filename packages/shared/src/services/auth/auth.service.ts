import * as admin from 'firebase-admin';

import { ExecutionLogger } from '../../definitions';
import { PERMISSIONS_BY_ROLE, UserCompanyRole } from '../../domain/models/user-company-relation.model';
import { SubscriptionsRepository } from '../../repositories/subscriptions/subscriptions.repository';
import { UserCompanyRelationsRepository } from '../../repositories/user-company-relations/user-company-relations.repository';
import { ERROR_MESSAGES, PERMISSIONS_SUFFIXES, STEPS } from './auth.service.constants';
import { DecodeEmailTokenError, DecodeEmailTokenErrorCode } from './auth.service.errors';
import { UserPermissions } from './auth.service.interfaces';

export class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!this.instance) {
      this.instance = new AuthService();
    }
    return this.instance;
  }
  public async decodeEmailToken(token: string): Promise<{ email: string}> {
    try {
      const { email } = await admin.auth().verifyIdToken(token);
      if (!email) {
        throw new DecodeEmailTokenError({ code: DecodeEmailTokenErrorCode.INVALID_TOKEN, message: ERROR_MESSAGES.NO_EMAIL_IN_TOKEN });
      }
      return { email };
    } catch (err: any) {
      if (err.errorInfo) {
        throw new DecodeEmailTokenError({ code: DecodeEmailTokenErrorCode.INVALID_TOKEN, message: err.errorInfo.message });
      }
      throw err;
    }
  }

  public async generateUserToken(userId: string, logger: ExecutionLogger): Promise<string> {
    const logGroup = `${this.constructor.name}.${this.generateUserToken.name}`;
    logger.startStep(STEPS.GET_USER_COMPANY_RELATIONS.id, logGroup);
    const permissions = await this.getUserPermissions(userId, logger);
    logger.endStep(STEPS.GET_USER_COMPANY_RELATIONS.id);
    logger.startStep(STEPS.GENERATE_USER_TOKEN.id, logGroup);
    const token = await admin.auth().createCustomToken(userId, permissions);
    logger.endStep(STEPS.GENERATE_USER_TOKEN.id);
    return token;
  }

  public async updatePermissionsToUser(input: {
    userId: string,
    uid: string,
  }, logger: ExecutionLogger): Promise<void> {
    const logGroup = `${this.constructor.name}.${this.updatePermissionsToUser.name}`;
    logger.startStep(STEPS.GET_USER_COMPANY_RELATIONS.id, logGroup);
    const permissions = await this.getUserPermissions(input.userId, logger);
    logger.endStep(STEPS.GET_USER_COMPANY_RELATIONS.id);
    logger.startStep(STEPS.UPDATE_USER_PERMISSIONS.id, logGroup);
    await admin.auth().setCustomUserClaims(input.uid, {
      ...permissions,
      app_user_id: input.userId,
    });
    logger.endStep(STEPS.UPDATE_USER_PERMISSIONS.id);
  }

  public async getUserPermissions(userId: string, logger: ExecutionLogger): Promise<UserPermissions> {
    const logGroup = `${this.constructor.name}.${this.getUserPermissions.name}`;
    logger.startStep(STEPS.GET_USER_COMPANY_RELATIONS.id, logGroup);
    const userCompanyRelations = await UserCompanyRelationsRepository.getInstance().getDocumentsList({
      userId: [{ operator: '==', value: userId }],
    }, logger).finally(() => logger.endStep(STEPS.GET_USER_COMPANY_RELATIONS.id));
    const response: {app_user_id: string, companies: { [companyId: string]: string[] } } = { app_user_id: userId, companies: {} };
    // get subscriptions of this companies
    const now = new Date();
    logger.startStep(STEPS.GET_SUBSCRIPTIONS.id, logGroup);
    const companySubscriptions = await Promise.all(userCompanyRelations.map(async (relation) => SubscriptionsRepository.getInstance().getDocumentsList({
      companyId: [{ operator: '==', value: relation.companyId }],
      startsAt: [{ operator: '<=', value: now }],
      endsAt: [{ operator: '>=', value: now }],
    }, logger))).finally(() => logger.endStep(STEPS.GET_SUBSCRIPTIONS.id));
    for (const index in userCompanyRelations) {
      const userCompanyRelation = userCompanyRelations[index];
      const subscriptions = companySubscriptions[index];
      response.companies[userCompanyRelation.companyId] = PERMISSIONS_BY_ROLE[userCompanyRelation.role as UserCompanyRole];
      if (!subscriptions.length) { // if no subscription, replace write permissions with read permissions
        response.companies[userCompanyRelation.companyId] = response.companies[userCompanyRelation.companyId].map((permission) => permission.replace(PERMISSIONS_SUFFIXES.WRITE, PERMISSIONS_SUFFIXES.READ));
      }
    }
    return response;
  }
}