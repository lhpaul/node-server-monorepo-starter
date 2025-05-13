import { FromSchema } from 'json-schema-to-ts';

import { COMPANY_ENDPOINTS_PARAMS_JSON_SCHEMA } from '../../companies.endpoints.constants';

export type DeleteCompanyParams = FromSchema<
  typeof COMPANY_ENDPOINTS_PARAMS_JSON_SCHEMA
>;
