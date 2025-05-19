import {
  API_KEY_HEADER,
  UNAUTHORIZED_ERROR,
  UNAUTHORIZED_ERROR_STATUS_CODE,
  FORBIDDEN_ERROR,
  FORBIDDEN_ERROR_STATUS_CODE,
} from '@repo/fastify';
import { ApiKeysService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

export async function authenticateApiKey(request: FastifyRequest, reply: FastifyReply, done: () => void) {
  const apiKey = request.headers[API_KEY_HEADER] as string;
  if (!apiKey) {
    request.log.warn({
      logId: UNAUTHORIZED_ERROR.logId
    }, UNAUTHORIZED_ERROR.logMessage);
    return reply.code(UNAUTHORIZED_ERROR_STATUS_CODE).send({ code: UNAUTHORIZED_ERROR.responseCode, message: UNAUTHORIZED_ERROR.responseMessage });
  }
  const [oauthClientId, apiKeyValue] = Buffer.from(apiKey, 'base64').toString().split(':');
  const { isValid } = await ApiKeysService.getInstance().validateApiKey(oauthClientId, apiKeyValue);
  if (!isValid) {
    request.log.warn({
      logId: FORBIDDEN_ERROR.logId
    }, FORBIDDEN_ERROR.logMessage);
    return reply.code(FORBIDDEN_ERROR_STATUS_CODE).send({ code: FORBIDDEN_ERROR.responseCode, message: FORBIDDEN_ERROR.responseMessage });
  }
  done();
}
