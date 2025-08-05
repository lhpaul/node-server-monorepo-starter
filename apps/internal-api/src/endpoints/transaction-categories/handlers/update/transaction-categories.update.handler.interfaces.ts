import { FromSchema } from 'json-schema-to-ts';

import { TRANSACTION_CATEGORY_ENDPOINTS_PARAMS_JSON_SCHEMA, UPDATE_TRANSACTION_CATEGORY_BODY_JSON_SCHEMA } from '../../transaction-categories.endpoints.constants';

export type UpdateTransactionCategoryBody = FromSchema<
  typeof UPDATE_TRANSACTION_CATEGORY_BODY_JSON_SCHEMA
>;

export type UpdateTransactionCategoryParams = FromSchema<
  typeof TRANSACTION_CATEGORY_ENDPOINTS_PARAMS_JSON_SCHEMA
>;