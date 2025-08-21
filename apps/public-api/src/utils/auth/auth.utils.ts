import { ExecutionLogger } from '@repo/shared/definitions';
import {
  CompaniesService,
  UserCompanyRelationsService,
  UserCompanyRole,
} from '@repo/shared/domain';
import * as admin from 'firebase-admin';

import { UserPermissions } from '../../definitions/auth.interfaces';
import { PERMISSIONS_BY_ROLE } from '../../constants/permissions.constants';
import {
  DECODE_EMAIL_TOKEN_ERROR_MESSAGES,
  GENERATE_USER_TOKEN_STEPS,
  GET_USER_PERMISSIONS_STEPS,
  LOG_GROUP_NAME,
  PERMISSIONS_SUFFIXES,
  UPDATE_USER_PERMISSIONS_LOGS,
  UPDATE_USER_PERMISSIONS_STEPS,
} from './auth.utils.constants';
import { DecodeEmailTokenError, DecodeEmailTokenErrorCode } from './auth.utils.errors';

export async function decodeEmailToken(token: string): Promise<{ email: string}> {
  try {
    const { email } = await admin.auth().verifyIdToken(token);
    if (!email) {
      throw new DecodeEmailTokenError({ code: DecodeEmailTokenErrorCode.INVALID_TOKEN, message: DECODE_EMAIL_TOKEN_ERROR_MESSAGES.NO_EMAIL_IN_TOKEN });
    }
    return { email };
  } catch (err: any) {
    if (err.errorInfo) {
      throw new DecodeEmailTokenError({ code: DecodeEmailTokenErrorCode.INVALID_TOKEN, message: err.errorInfo.message });
    }
    throw err;
  }
}

export async function generateUserToken(userId: string, logger: ExecutionLogger): Promise<string> {
  const logGroup = `${LOG_GROUP_NAME}.${generateUserToken.name}`;
  logger.startStep(GENERATE_USER_TOKEN_STEPS.GENERATE_USER_TOKEN, logGroup);
  const token = await admin.auth().createCustomToken(userId, {
    app_user_id: userId,
  }); // we only add basic claims because claims added in token creation cannot be later updated
  logger.endStep(GENERATE_USER_TOKEN_STEPS.GENERATE_USER_TOKEN);
  return token;
}

export async function getUserPermissions(userId: string, logger: ExecutionLogger): Promise<UserPermissions> {
  const logGroup = `${LOG_GROUP_NAME}.${getUserPermissions.name}`;
  logger.startStep(GET_USER_PERMISSIONS_STEPS.GET_USER_COMPANY_RELATIONS, logGroup);
  const userCompanyRelations = await UserCompanyRelationsService.getInstance().getUserCompanyRelations(userId, logger);
  logger.endStep(GET_USER_PERMISSIONS_STEPS.GET_USER_COMPANY_RELATIONS);
  const response: { companies: { [key: string]: string[] } } = { companies: {} };
  // get subscriptions of this companies
  logger.startStep(GET_USER_PERMISSIONS_STEPS.GET_SUBSCRIPTIONS, logGroup);
  const companySubscriptions = await Promise.all(userCompanyRelations.map(async (relation) => {
    const subscriptions = await CompaniesService.getInstance().getActiveSubscriptions(relation.companyId, logger);
    return subscriptions;
  }));
  logger.endStep(GET_USER_PERMISSIONS_STEPS.GET_SUBSCRIPTIONS);
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

export async function updatePermissionsToUser(input: {
  userId: string,
  uid: string,
}, logger: ExecutionLogger): Promise<void> {
  const logGroup = `${LOG_GROUP_NAME}.${updatePermissionsToUser.name}`;
  logger.startStep(UPDATE_USER_PERMISSIONS_STEPS.GET_USER_PERMISSIONS, logGroup);
  const permissions = await getUserPermissions(input.userId, logger)
    .finally(() => logger.endStep(UPDATE_USER_PERMISSIONS_STEPS.GET_USER_PERMISSIONS));
  logger.info({ // we log the permissions to the user to be able to debug in case of issues
    logId: UPDATE_USER_PERMISSIONS_LOGS.GET_USER_PERMISSIONS.logId,
    permissions
  }, UPDATE_USER_PERMISSIONS_LOGS.GET_USER_PERMISSIONS.message);
  logger.startStep(UPDATE_USER_PERMISSIONS_STEPS.UPDATE_USER_PERMISSIONS, logGroup);
  await admin.auth().setCustomUserClaims(input.uid, permissions)
    .finally(() => logger.endStep(UPDATE_USER_PERMISSIONS_STEPS.UPDATE_USER_PERMISSIONS));
}