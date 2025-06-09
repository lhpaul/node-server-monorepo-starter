import { FromSchema } from 'json-schema-to-ts';
import { SUBSCRIPTION_ENDPOINTS_PARAMS_JSON_SCHEMA } from '../../subscriptions.endpoints.constants';

export type GetSubscriptionParams = FromSchema<typeof SUBSCRIPTION_ENDPOINTS_PARAMS_JSON_SCHEMA>;
