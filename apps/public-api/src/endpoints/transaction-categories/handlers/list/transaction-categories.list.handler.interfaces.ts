import { FromSchema } from 'json-schema-to-ts';

import { LIST_TRANSACTION_CATEGORIES_QUERY_JSON_SCHEMA } from '../../transaction-categories.endpoints.constants';

export type ListTransactionCategoriesQuery = FromSchema<
  typeof LIST_TRANSACTION_CATEGORIES_QUERY_JSON_SCHEMA
>; 
