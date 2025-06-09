import { FromSchema } from 'json-schema-to-ts';
import {
  SUBSCRIPTION_ENDPOINTS_PARAMS_JSON_SCHEMA,
  UPDATE_SUBSCRIPTION_BODY_JSON_SCHEMA,
} from '../../subscriptions.endpoints.constants';

export type UpdateSubscriptionParams = FromSchema<
  typeof SUBSCRIPTION_ENDPOINTS_PARAMS_JSON_SCHEMA
>;

export type UpdateSubscriptionBody = FromSchema<
  typeof UPDATE_SUBSCRIPTION_BODY_JSON_SCHEMA
>; 