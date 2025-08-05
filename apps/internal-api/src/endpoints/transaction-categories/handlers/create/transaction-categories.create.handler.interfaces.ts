import { FromSchema } from 'json-schema-to-ts';

import { CREATE_TRANSACTION_CATEGORY_BODY_JSON_SCHEMA } from '../../transaction-categories.endpoints.constants';

export type CreateTransactionCategoryBody = FromSchema<
  typeof CREATE_TRANSACTION_CATEGORY_BODY_JSON_SCHEMA
>;