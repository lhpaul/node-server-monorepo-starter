import { FromSchema } from 'json-schema-to-ts';

import { LOGIN_BODY_JSON_SCHEMA } from '../../auth.endpoints.constants';

export type LoginBody = FromSchema<typeof LOGIN_BODY_JSON_SCHEMA>;
