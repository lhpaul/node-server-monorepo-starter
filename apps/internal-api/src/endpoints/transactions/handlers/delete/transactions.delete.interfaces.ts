import { FromSchema } from 'json-schema-to-ts';

import { TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA } from '../../transactions.endpoints.constants';

export type DeleteTransactionParams = FromSchema<
  typeof TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA
>;
