import * as admin from 'firebase-admin';

import { ExecutionContext } from '../../definitions/executions.interfaces';
import { PERMISSIONS_BY_ROLE } from '../../domain/models/user-company-relation.model';
import { processLoggerMock } from '../../mocks/process-logger.mocks';
import { UserCompanyRelationsRepository } from '../../repositories/user-company-relations/user-company-relations.repository';
import { UserPermissions } from './auth.service.interfaces';
import { ERROR_MESSAGES, STEPS } from './auth.service.constants';
import { DecodeEmailTokenError } from './auth.service.errors';
import { DecodeEmailTokenErrorCode } from './auth.service.errors';

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

  public async generateUserToken(userId: string, context?: ExecutionContext): Promise<string> {
    const logger = context?.logger ?? processLoggerMock;
    logger.startStep(STEPS.GET_USER_COMPANY_RELATIONS.id);
    const permissions = await this._getUserPermissions(userId);
    logger.endStep(STEPS.GET_USER_COMPANY_RELATIONS.id);
    logger.startStep(STEPS.GENERATE_USER_TOKEN.id);
    const token = await admin.auth().createCustomToken(userId, permissions);
    logger.endStep(STEPS.GENERATE_USER_TOKEN.id);
    return token;
  }

  public async updatePermissionsToUser(input: {
    userId: string,
    uid: string,
  }, context?: ExecutionContext): Promise<void> {
    const logger = context?.logger ?? processLoggerMock;
    logger.startStep(STEPS.GET_USER_COMPANY_RELATIONS.id);
    const permissions = await this._getUserPermissions(input.userId);
    logger.endStep(STEPS.GET_USER_COMPANY_RELATIONS.id);
    logger.startStep(STEPS.UPDATE_USER_PERMISSIONS.id);
    await admin.auth().setCustomUserClaims(input.uid, {
      ...permissions,
      app_user_id: input.userId,
    });
    logger.endStep(STEPS.UPDATE_USER_PERMISSIONS.id);
  }

  private async _getUserPermissions(userId: string): Promise<UserPermissions> {
    const userCompanyRelations = await UserCompanyRelationsRepository.getInstance().getUserCompanyRelations({
      userId: [{ operator: '==', value: userId }],
    });
    const response: { companies: { [companyId: string]: string[] } } = { companies: {} };
    for (const userCompanyRelation of userCompanyRelations) {
      response.companies[userCompanyRelation.companyId] = PERMISSIONS_BY_ROLE[userCompanyRelation.role];
    }
    return response;
  }
}