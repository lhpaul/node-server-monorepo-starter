import { FromSchema } from 'json-schema-to-ts';
import {
  COMPANY_TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
  UPDATE_COMPANY_TRANSACTION_BODY_JSON_SCHEMA,
} from '../../transactions.endpoints.constants';

export type UpdateTransactionParams = FromSchema<
  typeof COMPANY_TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA
>;
export type UpdateTransactionBody = FromSchema<
  typeof UPDATE_COMPANY_TRANSACTION_BODY_JSON_SCHEMA
>;
