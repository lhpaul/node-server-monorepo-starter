import { FromSchema } from 'json-schema-to-ts';

import { QUERY_STRING_JSON_SCHEMA } from '../../subscriptions.endpoints';

export type GetSubscriptionsQueryParams = FromSchema<
  typeof QUERY_STRING_JSON_SCHEMA
>;