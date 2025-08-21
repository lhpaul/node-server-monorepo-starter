import { FromSchema } from 'json-schema-to-ts';

import { UPDATE_COMPANY_FINANCIAL_INSTITUTION_BODY_JSON_SCHEMA, COMPANY_FINANCIAL_INSTITUTION_ENDPOINTS_PARAMS_JSON_SCHEMA } from '../../financial-institutions.endpoints.constants';


export type UpdateCompanyFinancialInstitutionBody = FromSchema<
  typeof UPDATE_COMPANY_FINANCIAL_INSTITUTION_BODY_JSON_SCHEMA
>;

export type UpdateCompanyFinancialInstitutionParams = FromSchema<
  typeof COMPANY_FINANCIAL_INSTITUTION_ENDPOINTS_PARAMS_JSON_SCHEMA
>;