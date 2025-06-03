import {
  API_KEY_HEADER,
  UNAUTHORIZED_ERROR,
  FORBIDDEN_ERROR,
  STATUS_CODES,
} from '@repo/fastify';
import { PrivateKeysService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

export async function authenticateApiKey(request: FastifyRequest, reply: FastifyReply) {
  const apiKey = request.headers[API_KEY_HEADER] as string;
  if (!apiKey) {
    request.log.warn({
      logId: UNAUTHORIZED_ERROR.logId
    }, UNAUTHORIZED_ERROR.logMessage);
    return reply.code(STATUS_CODES.UNAUTHORIZED).send({ code: UNAUTHORIZED_ERROR.responseCode, message: UNAUTHORIZED_ERROR.responseMessage });
  }
  const [oauthClientId, privateKeyValue] = Buffer.from(apiKey, 'base64').toString().split(':');
  const { isValid } = await PrivateKeysService.getInstance().validatePrivateKey(oauthClientId, privateKeyValue, request.log);
  if (!isValid) {
    request.log.warn({
      logId: FORBIDDEN_ERROR.logId
    }, FORBIDDEN_ERROR.logMessage);
    return reply.code(STATUS_CODES.FORBIDDEN).send({ code: FORBIDDEN_ERROR.responseCode, message: FORBIDDEN_ERROR.responseMessage });
  }
}
