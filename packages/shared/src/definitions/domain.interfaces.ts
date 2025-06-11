export interface ResourceModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type FilterOperator =
  | '=='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'in'
  | 'not-in';
export type FilterItem<T> = {
  value: T | T[];
  operator: FilterOperator;
};

export interface FilterInput {
  [key: string]: FilterItem<any>[] | undefined;
}