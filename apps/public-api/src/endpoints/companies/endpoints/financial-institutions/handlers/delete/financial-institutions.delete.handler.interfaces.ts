import { FromSchema } from 'json-schema-to-ts';

import { COMPANY_FINANCIAL_INSTITUTION_ENDPOINTS_PARAMS_JSON_SCHEMA } from '../../financial-institutions.endpoints.constants';

export type DeleteCompanyFinancialInstitutionParams = FromSchema<
  typeof COMPANY_FINANCIAL_INSTITUTION_ENDPOINTS_PARAMS_JSON_SCHEMA
>;