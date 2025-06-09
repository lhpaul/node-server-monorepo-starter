import { FromSchema } from 'json-schema-to-ts';

import { QUERY_STRING_JSON_SCHEMA } from '../../transactions.endpoints';

export type GetTransactionsQueryParams = FromSchema<
  typeof QUERY_STRING_JSON_SCHEMA
>;
