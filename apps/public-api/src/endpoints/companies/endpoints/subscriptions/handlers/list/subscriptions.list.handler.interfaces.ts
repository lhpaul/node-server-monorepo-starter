import { FromSchema } from 'json-schema-to-ts';
import { COMPANY_SUBSCRIPTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA } from '../../subscriptions.endpoints.constants';
import { QUERY_STRING_JSON_SCHEMA } from '../../subscriptions.endpoints';

export type ListSubscriptionsParams = FromSchema<
  typeof COMPANY_SUBSCRIPTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA
>;

export type GetSubscriptionsQueryParams = FromSchema<
  typeof QUERY_STRING_JSON_SCHEMA
>;
