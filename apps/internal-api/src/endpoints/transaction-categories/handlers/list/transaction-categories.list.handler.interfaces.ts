import { FromSchema } from 'json-schema-to-ts';

import { QUERY_STRING_JSON_SCHEMA } from '../../transaction-categories.endpoints';

export type ListTransactionCategoriesQuery = FromSchema<
  typeof QUERY_STRING_JSON_SCHEMA
>; 