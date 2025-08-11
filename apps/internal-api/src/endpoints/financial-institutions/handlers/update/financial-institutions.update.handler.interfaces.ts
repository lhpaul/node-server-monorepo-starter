import { FromSchema } from 'json-schema-to-ts';

import { FINANCIAL_INSTITUTION_ENDPOINTS_PARAMS_JSON_SCHEMA, UPDATE_FINANCIAL_INSTITUTION_BODY_JSON_SCHEMA } from '../../financial-institutions.endpoints.constants';

export type UpdateFinancialInstitutionBody = FromSchema<
  typeof UPDATE_FINANCIAL_INSTITUTION_BODY_JSON_SCHEMA
>;

export type UpdateFinancialInstitutionParams = FromSchema<
  typeof FINANCIAL_INSTITUTION_ENDPOINTS_PARAMS_JSON_SCHEMA
>;