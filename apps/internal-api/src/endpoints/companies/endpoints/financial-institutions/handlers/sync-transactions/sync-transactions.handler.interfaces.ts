import { FromSchema } from 'json-schema-to-ts';

import { SYNC_TRANSACTIONS_BODY_JSON_SCHEMA, SYNC_TRANSACTIONS_PARAMS_JSON_SCHEMA } from '../../financial-institutions.endpoints.constants';

export type SyncTransactionsBody = FromSchema<
  typeof SYNC_TRANSACTIONS_BODY_JSON_SCHEMA
>;

export type SyncTransactionsParams = FromSchema<
  typeof SYNC_TRANSACTIONS_PARAMS_JSON_SCHEMA
>; 