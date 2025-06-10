import * as admin from 'firebase-admin';

import { PERMISSIONS_BY_ROLE } from '../../domain/models/user-company-relation.model';
import { SubscriptionsRepository } from '../../repositories/subscriptions/subscriptions.repository';
import { UserCompanyRelationsRepository } from '../../repositories/user-company-relations/user-company-relations.repository';
import { UserPermissions } from './auth.service.interfaces';
import { ERROR_MESSAGES, PERMISSIONS_SUFFIXES, STEPS } from './auth.service.constants';
import { DecodeEmailTokenError } from './auth.service.errors';
import { DecodeEmailTokenErrorCode } from './auth.service.errors';
import { ExecutionLogger } from '../../definitions/logging.interfaces';

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
    logger.startStep(STEPS.GET_USER_COMPANY_RELATIONS.id);
    const permissions = await this._getUserPermissions(userId, logger);
    logger.endStep(STEPS.GET_USER_COMPANY_RELATIONS.id);
    logger.startStep(STEPS.GENERATE_USER_TOKEN.id);
    const token = await admin.auth().createCustomToken(userId, permissions);
    logger.endStep(STEPS.GENERATE_USER_TOKEN.id);
    return token;
  }

  public async updatePermissionsToUser(input: {
    userId: string,
    uid: string,
  }, logger: ExecutionLogger): Promise<void> {
    logger.startStep(STEPS.GET_USER_COMPANY_RELATIONS.id);
    const permissions = await this._getUserPermissions(input.userId, logger);
    logger.endStep(STEPS.GET_USER_COMPANY_RELATIONS.id);
    logger.startStep(STEPS.UPDATE_USER_PERMISSIONS.id);
    await admin.auth().setCustomUserClaims(input.uid, {
      ...permissions,
      app_user_id: input.userId,
    });
    logger.endStep(STEPS.UPDATE_USER_PERMISSIONS.id);
  }

  private async _getUserPermissions(userId: string, logger: ExecutionLogger): Promise<UserPermissions> {
    logger.startStep(STEPS.GET_USER_COMPANY_RELATIONS.id);
    const userCompanyRelations = await UserCompanyRelationsRepository.getInstance().getDocumentsList({
      userId: [{ operator: '==', value: userId }],
    }, logger).finally(() => logger.endStep(STEPS.GET_USER_COMPANY_RELATIONS.id));

    logger.startStep(STEPS.GET_SUBSCRIPTIONS.id);
    const now = new Date();
    const subscriptions = await SubscriptionsRepository.getInstance().getDocumentsList({
      companyId: [{ operator: 'in', value: userCompanyRelations.map((relation) => relation.companyId) }],
      startsAt: [{ operator: '<=', value: now }],
      endsAt: [{ operator: '>=', value: now }],
    }, logger).finally(() => logger.endStep(STEPS.GET_SUBSCRIPTIONS.id));
    
    const response: { companies: {[companyId: string]: string[] } } = { companies: {} };
    for (const userCompanyRelation of userCompanyRelations) {
      const companySubscription = subscriptions.find((subscription) => subscription.companyId === userCompanyRelation.companyId);
      response.companies[userCompanyRelation.companyId] = PERMISSIONS_BY_ROLE[userCompanyRelation.role];
      if (!companySubscription) { // if no subscription, change write permissions to read permissions
        response.companies[userCompanyRelation.companyId] = response.companies[userCompanyRelation.companyId].map((permission) => permission.replace(PERMISSIONS_SUFFIXES.WRITE, PERMISSIONS_SUFFIXES.READ));
      }
    }
    return response;
  }
}