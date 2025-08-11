import { EntityModel } from '../../definitions/domain.interfaces';

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum TransactionSourceType {
  USER = 'user',
  FINANCIAL_INSTITUTION = 'financial-institution',
}

export class Transaction implements EntityModel {
  public readonly amount: number; // amount of the transaction
  public readonly categoryId: string | null; // id of the category of the transaction
  public readonly companyId: string; // id of the company
  public readonly createdAt: Date; // date of creation
  public readonly date: string; // date of the transaction
  public readonly description: string; // description of the transaction
  public readonly id: string; // id of the transaction
  public readonly sourceId: string; // id of the source of the transaction
  public readonly sourceTransactionId: string; // id of the source transaction
  public readonly sourceType: TransactionSourceType; // type of the source of the transaction
  public readonly type: TransactionType; // type of the transaction
  public readonly updatedAt: Date; // date of last update

  constructor(transaction: Required<Transaction>) {
    Object.assign(this, transaction);
  }
}
