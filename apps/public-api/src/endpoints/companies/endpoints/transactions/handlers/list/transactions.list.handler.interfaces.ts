import { FromSchema } from 'json-schema-to-ts';

import { COMPANY_TRANSACTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA } from '../../transactions.endpoints.constants';
import { QUERY_STRING_JSON_SCHEMA } from '../../transactions.endpoints';


export type GetTransactionsQueryParams = FromSchema<
  typeof QUERY_STRING_JSON_SCHEMA
>;

export type GetTransactionsParams = FromSchema<
  typeof COMPANY_TRANSACTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA
>;
