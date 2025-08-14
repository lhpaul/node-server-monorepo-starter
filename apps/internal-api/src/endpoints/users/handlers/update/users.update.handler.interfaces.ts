import { FromSchema } from 'json-schema-to-ts';

import { UPDATE_USER_BODY_JSON_SCHEMA } from '../../users.endpoints.constants';

export type UpdateUserBody = FromSchema<
  typeof UPDATE_USER_BODY_JSON_SCHEMA
>;
