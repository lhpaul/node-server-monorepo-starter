import { FromSchema } from 'json-schema-to-ts';

import { COMPANY_TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA, CREATE_COMPANY_TRANSACTION_BODY_JSON_SCHEMA } from '../../transactions.endpoints.constants';

export type CreateCompanyTransactionParams = FromSchema<
  typeof COMPANY_TRANSACTION_ENDPOINTS_PARAMS_JSON_SCHEMA
>;

export type CreateCompanyTransactionBody = FromSchema<
  typeof CREATE_COMPANY_TRANSACTION_BODY_JSON_SCHEMA
>;
