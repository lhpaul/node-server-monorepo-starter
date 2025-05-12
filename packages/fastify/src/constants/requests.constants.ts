import { QueryOperator } from '@repo/shared/definitions';

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
