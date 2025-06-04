export type QueryOperator =
  | '=='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'in'
  | 'not-in'
  | 'array-contains'
  | 'array-contains-any';
export type QueryItem<T> = {
  value: T | T[];
  operator: QueryOperator;
};

export interface QueryInput {
  [key: string]: boolean | null | number | string | QueryItem<any> | QueryItem<any>[] | undefined;
}
