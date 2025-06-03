export type QueryOperator =
  | '=='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'in'
  | 'not-in';
export type IQueryOptions<T> = {
  value: T | T[];
  operator: QueryOperator;
};

export interface IQueryInput {
  [key: string]: IQueryOptions<any>[] | undefined;
}
