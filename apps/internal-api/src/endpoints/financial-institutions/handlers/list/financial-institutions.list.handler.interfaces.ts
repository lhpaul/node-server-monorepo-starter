import { FromSchema } from 'json-schema-to-ts';

import { QUERY_STRING_JSON_SCHEMA } from '../../financial-institutions.endpoints';

export type ListFinancialInstitutionsQuery = FromSchema<
  typeof QUERY_STRING_JSON_SCHEMA
>; 