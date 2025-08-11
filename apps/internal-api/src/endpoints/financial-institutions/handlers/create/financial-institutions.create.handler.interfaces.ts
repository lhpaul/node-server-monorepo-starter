import { FromSchema } from 'json-schema-to-ts';

import { CREATE_FINANCIAL_INSTITUTION_BODY_JSON_SCHEMA } from '../../financial-institutions.endpoints.constants';

export type CreateFinancialInstitutionBody = FromSchema<
  typeof CREATE_FINANCIAL_INSTITUTION_BODY_JSON_SCHEMA
>;