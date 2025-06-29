import { ResourceModel } from '../../definitions/domain.interfaces';

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export class Transaction implements ResourceModel {
  public readonly amount: number; // amount of the transaction
  public readonly companyId: string; // id of the company
  public readonly createdAt: Date; // date of creation
  public readonly date: string; // date of the transaction
  public readonly id: string; // id of the transaction
  public readonly type: TransactionType; // type of the transaction
  public readonly updatedAt: Date; // date of last update

  constructor(transaction: Required<Transaction>) {
    Object.assign(this, transaction);
  }
}
