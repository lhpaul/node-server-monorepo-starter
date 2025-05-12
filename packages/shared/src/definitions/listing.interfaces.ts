export type QueryOperator =
  | '=='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'in'
  | 'not-in';
export type QueryOptions<T> = {
  value: T | T[];
  operator: QueryOperator;
};

export interface QueryInput {
  [key: string]: QueryOptions<any>[] | undefined;
}
