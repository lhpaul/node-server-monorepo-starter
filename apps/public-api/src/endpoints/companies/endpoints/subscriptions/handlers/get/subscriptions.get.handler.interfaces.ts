import { FromSchema } from 'json-schema-to-ts';
import { COMPANY_SUBSCRIPTION_ENDPOINTS_PARAMS_JSON_SCHEMA } from '../../subscriptions.endpoints.constants';

export type GetSubscriptionParams = FromSchema<
  typeof COMPANY_SUBSCRIPTION_ENDPOINTS_PARAMS_JSON_SCHEMA
>; 