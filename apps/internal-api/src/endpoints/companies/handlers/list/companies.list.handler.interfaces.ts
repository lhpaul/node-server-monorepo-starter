import { FromSchema } from 'json-schema-to-ts';

import { QUERY_STRING_JSON_SCHEMA } from '../../companies.endpoints';

export type GetCompaniesQueryParams = FromSchema<
  typeof QUERY_STRING_JSON_SCHEMA
>;
