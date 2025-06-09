import { FromSchema } from 'json-schema-to-ts';

import { COMPANY_TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA } from '../../transactions.endpoints.constants';

export type GetTransactionParams = FromSchema<
  typeof COMPANY_TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA
>;
