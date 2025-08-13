import { FromSchema } from 'json-schema-to-ts';

import { COMPANY_FINANCIAL_INSTITUTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA, CREATE_COMPANY_FINANCIAL_INSTITUTION_BODY_JSON_SCHEMA } from '../../financial-institutions.endpoints.constants';

export type CreateCompanyFinancialInstitutionBody = FromSchema<
  typeof CREATE_COMPANY_FINANCIAL_INSTITUTION_BODY_JSON_SCHEMA
>;

export type CreateCompanyFinancialInstitutionParams = FromSchema<
  typeof COMPANY_FINANCIAL_INSTITUTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA
>;
