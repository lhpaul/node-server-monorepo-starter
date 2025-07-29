import { ResourceModel } from '../../definitions';

export enum TransactionCategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export class TransactionCategory implements ResourceModel {
  public readonly createdAt: Date; // date of creation
  public readonly id: string;
  public readonly name: string; // name of the category
  public readonly type: TransactionCategoryType; // type of the category
  public readonly updatedAt: Date; // date of last update

  constructor(transactionCategory: Required<TransactionCategory>) {
    Object.assign(this, transactionCategory);
  }
}