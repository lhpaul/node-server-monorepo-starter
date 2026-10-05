import { FromSchema } from 'json-schema-to-ts';

import { CREATE_EXAMPLE_BODY_JSON_SCHEMA, EXAMPLE_PARAMS_JSON_SCHEMA } from '../../examples.endpoints.constants';

export type CreateExampleParams = FromSchema<
  typeof EXAMPLE_PARAMS_JSON_SCHEMA
>;

export type CreateExampleBody = FromSchema<
  typeof CREATE_EXAMPLE_BODY_JSON_SCHEMA
>;
