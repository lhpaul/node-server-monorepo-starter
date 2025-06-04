import { createEndpoint, HTTP_METHODS_MAP } from '@repo/fastify';
import { FastifyInstance, RouteOptions } from 'fastify';

import { LOGIN_BODY_JSON_SCHEMA, URL_LOGIN, URL_UPDATE_CLAIMS } from './auth.endpoints.constants';
import { loginHandler } from './handlers/login/login.handler';
import { updateClaimsHandler } from './handlers/update-claims/update-claims.handler';

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
        requestPayloadFields: ['token'],
        responsePayloadFields: ['token'],
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.UPDATE],
      url: URL_UPDATE_CLAIMS,
      handler: updateClaimsHandler,
    })
  ];
}