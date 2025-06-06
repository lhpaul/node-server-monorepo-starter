import { QueryOperator } from '@repo/shared/definitions';

export const HTTP_METHODS_MAP = {
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
  QueryOperator
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
