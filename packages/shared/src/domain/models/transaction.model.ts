export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export class Transaction {
  amount: number; // amount of the transaction
  companyId: string; // id of the company
  date: string; // date of the transaction
  id: string; // id of the transaction
  type: TransactionType; // type of the transaction

  constructor(transaction: Partial<Transaction>) {
    Object.assign(this, transaction);
  }
}
