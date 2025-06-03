export type QueryOperator =
  | '=='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'in'
  | 'not-in';
export type QueryItem<T> = {
  value: T | T[];
  operator: QueryOperator;
};

export interface QueryInput {
  [key: string]: QueryItem<any>[] | undefined;
}
