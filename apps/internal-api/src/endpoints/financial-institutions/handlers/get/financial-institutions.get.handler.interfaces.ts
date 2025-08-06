import { FromSchema } from 'json-schema-to-ts';

import { FINANCIAL_INSTITUTION_ENDPOINTS_PARAMS_JSON_SCHEMA } from '../../financial-institutions.endpoints.constants';

export type GetFinancialInstitutionParams = FromSchema<
  typeof FINANCIAL_INSTITUTION_ENDPOINTS_PARAMS_JSON_SCHEMA
>;