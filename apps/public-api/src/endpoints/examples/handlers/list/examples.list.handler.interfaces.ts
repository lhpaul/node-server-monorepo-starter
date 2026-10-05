import { FromSchema } from 'json-schema-to-ts';

import { QUERY_STRING_JSON_SCHEMA } from '../../examples.endpoints.constants';

export type GetExamplesQueryParams = FromSchema<
  typeof QUERY_STRING_JSON_SCHEMA
>;
