export type QueryOperator = '==' | '!=' | '<' | '<=' | '>=' | '>' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in';
export type QueryOptions<T> = {
  value: T | T[];
  operator: QueryOperator;
};

export interface QueryInput {
  [field: string]: boolean | null | number | string | QueryOptions<any> | QueryOptions<any>[] | undefined;
}
