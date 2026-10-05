import { createEndpoint, HTTP_METHODS_MAP } from '@repo/fastify';
import { FastifyInstance, RouteOptions } from 'fastify';

import {
  CREATE_EXAMPLE_BODY_JSON_SCHEMA,
  EXAMPLE_PARAMS_JSON_SCHEMA,
  QUERY_STRING_JSON_SCHEMA,
  UPDATE_EXAMPLE_BODY_JSON_SCHEMA,
  URL_V1,
  URL_WITH_ID_V1,
} from './examples.endpoints.constants';
import { createExampleHandler } from './handlers/create/examples.create.handler';
import { getExampleHandler } from './handlers/get/examples.get.handler';
import { listExamplesHandler } from './handlers/list/examples.list.handler';
import { updateExampleHandler } from './handlers/update/examples.update.handler';
import { deleteExampleHandler } from './handlers/delete/examples.delete.handler';

export function examplesEndpointsBuilder(server: FastifyInstance): RouteOptions[] {
  return [
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.CREATE],
      url: URL_V1,
      handler: createExampleHandler,
      schema: {
        body: CREATE_EXAMPLE_BODY_JSON_SCHEMA
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.LIST],
      url: URL_V1,
      handler: listExamplesHandler,
      schema: {
        querystring: QUERY_STRING_JSON_SCHEMA,
        params: EXAMPLE_PARAMS_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.GET],
      url: URL_WITH_ID_V1,
      handler: getExampleHandler,
      schema: {
        params: EXAMPLE_PARAMS_JSON_SCHEMA,
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.UPDATE],
      url: URL_WITH_ID_V1,
      handler: updateExampleHandler,
      schema: {
        body: UPDATE_EXAMPLE_BODY_JSON_SCHEMA
      },
    }),
    createEndpoint(server, {
      method: [HTTP_METHODS_MAP.DELETE],
      url: URL_WITH_ID_V1,
      handler: deleteExampleHandler,
      schema: {
        params: EXAMPLE_PARAMS_JSON_SCHEMA,
      },
    }),
  ];
}