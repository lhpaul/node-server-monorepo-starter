import { createEndpoint, HTTP_METHODS_MAP } from '@repo/fastify';
import { FastifyInstance, RouteOptions } from 'fastify';

import { URL_LOGIN } from './auth.endpoints.constants';
import { LOGIN_BODY_JSON_SCHEMA } from './auth.endpoints.constants';
import { loginHandler } from './handlers/login/login.handler';
export function authEndpointsBuilder(server: FastifyInstance): RouteOptions[] {
  return [
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.CREATE],
      url: URL_LOGIN,
      handler: loginHandler,
      schema: {
        body: LOGIN_BODY_JSON_SCHEMA,
      },
    }, {
      authenticate: false,
      maskOptions: {
        requestPayloadFields: ['email', 'password'],
        responsePayloadFields: ['token'],
      },
    }),
  ];
}