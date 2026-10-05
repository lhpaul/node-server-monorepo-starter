import { ExecutionLogger } from '@repo/shared/definitions';
import {
  UsersService,
} from '@repo/shared/domain';
import * as admin from 'firebase-admin';

import {
  DECODE_EMAIL_TOKEN_ERROR_MESSAGES,
  GENERATE_USER_TOKEN_STEPS,
  LOG_GROUP_NAME,
  UPDATE_USER_PERMISSIONS_STEPS,
  UPDATE_USER_PERMISSIONS_ERROR_MESSAGES,
} from './auth.utils.constants';
import { DecodeEmailTokenError, DecodeEmailTokenErrorCode, UpdateUserPermissionsError, UpdateUserPermissionsErrorCode } from './auth.utils.errors';

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

export async function updatePermissionsToUser(input: {
  userId: string,
  uid: string,
}, logger: ExecutionLogger): Promise<void> {
  const logGroup = `${LOG_GROUP_NAME}.${updatePermissionsToUser.name}`;
  logger.startStep(UPDATE_USER_PERMISSIONS_STEPS.GET_USER, logGroup);
  const user = await UsersService.getInstance().getResource(input.userId, logger);
  logger.endStep(UPDATE_USER_PERMISSIONS_STEPS.GET_USER);
  if (!user) {
    throw new UpdateUserPermissionsError({ code: UpdateUserPermissionsErrorCode.USER_NOT_FOUND, message: UPDATE_USER_PERMISSIONS_ERROR_MESSAGES.USER_NOT_FOUND(input.userId) });
  }
  logger.startStep(UPDATE_USER_PERMISSIONS_STEPS.UPDATE_USER_PERMISSIONS, logGroup);
  await admin.auth().setCustomUserClaims(input.uid, {
    role: user.role,
  });
  logger.endStep(UPDATE_USER_PERMISSIONS_STEPS.UPDATE_USER_PERMISSIONS)
}