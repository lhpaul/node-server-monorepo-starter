import {
  buildSchemaForQueryParamsProperty,
  createEndpoint,
  HTTP_METHODS_MAP,
} from '@repo/fastify';
import { FastifyInstance, RouteOptions } from 'fastify';

import {
  USER_ENDPOINTS_PARAMS_JSON_SCHEMA,
  UPDATE_USER_BODY_JSON_SCHEMA,
  URL_V1,
  URL_WITH_ID_V1,
} from './users.endpoints.constants';
import {
  getUserHandler,
  listUsersHandler,
  updateUserHandler,
} from './handlers';

export const QUERY_STRING_JSON_SCHEMA = {
  type: 'object',
  properties: {
    ...buildSchemaForQueryParamsProperty('email', 'string', [
      'eq',
      'in',
    ]),
  },
} as const;

export function usersEndpointsBuilder(server: FastifyInstance): RouteOptions[] {
  return [
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.LIST],
      url: URL_V1,
      handler: listUsersHandler,
      schema: {
        querystring: QUERY_STRING_JSON_SCHEMA,
      },
    }, {
      maskOptions: {
        responsePayloadFields: ['email'],
      }
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.GET],
      url: URL_WITH_ID_V1,
      handler: getUserHandler,
      schema: {
        params: USER_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }, {
      maskOptions: {
        responsePayloadFields: ['email'],
      }
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.UPDATE],
      url: URL_WITH_ID_V1,
      handler: updateUserHandler,
      schema: {
        body: UPDATE_USER_BODY_JSON_SCHEMA,
        params: USER_ENDPOINTS_PARAMS_JSON_SCHEMA,
      },
    }, {
      maskOptions: {
        requestPayloadFields: ['email'],
      }
    }),
  ];
}
