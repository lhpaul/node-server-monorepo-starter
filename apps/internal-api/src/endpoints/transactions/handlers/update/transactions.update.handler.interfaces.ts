import { FromSchema } from 'json-schema-to-ts';
import {
  TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
  UPDATE_TRANSACTION_BODY_JSON_SCHEMA,
} from '../../transactions.endpoints.constants';

export type UpdateTransactionParams = FromSchema<
  typeof TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA
>;
export type UpdateTransactionBody = FromSchema<
  typeof UPDATE_TRANSACTION_BODY_JSON_SCHEMA
>;
