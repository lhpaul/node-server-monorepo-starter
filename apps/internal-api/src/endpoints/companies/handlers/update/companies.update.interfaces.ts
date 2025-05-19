import { FromSchema } from 'json-schema-to-ts';
import {
  COMPANY_ENDPOINTS_PARAMS_JSON_SCHEMA,
  UPDATE_COMPANY_BODY_JSON_SCHEMA,
} from '../../companies.endpoints.constants';

export type UpdateCompanyParams = FromSchema<
  typeof COMPANY_ENDPOINTS_PARAMS_JSON_SCHEMA
>;
export type UpdateCompanyBody = FromSchema<
  typeof UPDATE_COMPANY_BODY_JSON_SCHEMA
>;
