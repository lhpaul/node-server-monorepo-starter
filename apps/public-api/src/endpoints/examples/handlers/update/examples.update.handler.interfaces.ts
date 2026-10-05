import { FromSchema } from 'json-schema-to-ts';
import {
  UPDATE_EXAMPLE_BODY_JSON_SCHEMA,
} from '../../examples.endpoints.constants';
import { EXAMPLE_PARAMS_JSON_SCHEMA } from '../../examples.endpoints.constants';

export type UpdateExampleBody = FromSchema<
  typeof UPDATE_EXAMPLE_BODY_JSON_SCHEMA
>;

export type UpdateExampleParams = FromSchema<
  typeof EXAMPLE_PARAMS_JSON_SCHEMA
>;