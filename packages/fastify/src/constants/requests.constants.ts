import { FilterOperator } from '@repo/shared/definitions';

export const HTTP_METHODS_MAP = {
  OPTIONS: 'OPTIONS',
  LIST: 'GET',
  GET: 'GET',
  CREATE: 'POST',
  UPDATE: 'PATCH',
  SET: 'PUT',
  DELETE: 'DELETE'
};

export type QUERY_PARAMS_OPERATORS =
  | 'ge'
  | 'gt'
  | 'le'
  | 'lt'
  | 'eq'
  | 'ne'
  | 'in'
  | 'not-in';

export const QUERY_PARAMS_OPERATORS_MAP: Record<
  QUERY_PARAMS_OPERATORS,
  FilterOperator
> = {
  ge: '>=',
  gt: '>',
  le: '<=',
  lt: '<',
  eq: '==',
  ne: '!=',
  in: 'in',
  'not-in': 'not-in',
};
