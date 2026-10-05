import { buildSchemaForQueryParamsProperty } from "@repo/fastify";

export const URL_V1 = '/v1/examples';
export const URL_WITH_ID_V1 = `${URL_V1}/:id`;
export const EXAMPLE_NOT_FOUND_ERROR = (exampleId: string) => `Example with id ${exampleId} not found`;
export const CREATE_EXAMPLE_BODY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    description: { type: 'string' },
    name: { type: 'string' },
  },
  required: ['name'],
} as const;

export const UPDATE_EXAMPLE_BODY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    description: { type: 'string' },
    name: { type: 'string' },
  },
} as const;

export const EXAMPLE_PARAMS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'string' },
  },
  required: ['id'],
} as const;

export const QUERY_STRING_JSON_SCHEMA = {
  type: 'object',
  properties: {
    ...buildSchemaForQueryParamsProperty('description', 'string', [
      'eq',
      'ge',
      'gt',
      'le',
      'lt',
    ]),
    ...buildSchemaForQueryParamsProperty('name', 'string', [
      'eq',
      'ge',
      'gt',
      'le',
      'lt',
    ]),
  },
} as const;
