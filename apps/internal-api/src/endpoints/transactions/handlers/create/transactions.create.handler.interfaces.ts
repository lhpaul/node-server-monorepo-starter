import { FromSchema } from 'json-schema-to-ts';

import { CREATE_TRANSACTION_BODY_JSON_SCHEMA } from '../../transactions.endpoints.constants';

export type CreateTransactionBody = FromSchema<
  typeof CREATE_TRANSACTION_BODY_JSON_SCHEMA
>;
