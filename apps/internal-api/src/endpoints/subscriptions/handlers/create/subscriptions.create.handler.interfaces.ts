import { FromSchema } from 'json-schema-to-ts';

import { CREATE_SUBSCRIPTION_BODY_JSON_SCHEMA } from '../../subscriptions.endpoints.constants';

export type CreateSubscriptionBody = FromSchema<
  typeof CREATE_SUBSCRIPTION_BODY_JSON_SCHEMA
>;
