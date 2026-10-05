import { FromSchema } from 'json-schema-to-ts';

import { EXAMPLE_PARAMS_JSON_SCHEMA } from '../../examples.endpoints.constants';

export type DeleteExampleParams = FromSchema<
  typeof EXAMPLE_PARAMS_JSON_SCHEMA
>;
