import { FromSchema } from 'json-schema-to-ts';

import { CREATE_COMPANY_BODY_JSON_SCHEMA } from '../../companies.endpoints.constants';

export type CreateCompanyBody = FromSchema<
  typeof CREATE_COMPANY_BODY_JSON_SCHEMA
>;
