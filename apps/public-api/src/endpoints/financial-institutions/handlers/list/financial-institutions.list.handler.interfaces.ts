import { FromSchema } from 'json-schema-to-ts';

import { LIST_FINANCIAL_INSTITUTIONS_QUERY_JSON_SCHEMA } from '../../financial-institutions.endpoints.constants';

export type ListFinancialInstitutionsQuery = FromSchema<
  typeof LIST_FINANCIAL_INSTITUTIONS_QUERY_JSON_SCHEMA
>;