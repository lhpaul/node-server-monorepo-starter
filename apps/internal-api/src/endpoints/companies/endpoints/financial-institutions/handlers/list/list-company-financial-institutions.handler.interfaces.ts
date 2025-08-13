import { FromSchema } from 'json-schema-to-ts';
import { COMPANY_FINANCIAL_INSTITUTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA } from '../../financial-institutions.endpoints.constants';

export type ListCompanyFinancialInstitutionsParams = FromSchema<
  typeof COMPANY_FINANCIAL_INSTITUTIONS_ENDPOINTS_PARAMS_JSON_SCHEMA
>; 