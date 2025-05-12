export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export class Transaction {
  amount: number;
  date: string;
  id: string;
  type: TransactionType;

  constructor(transaction: Partial<Transaction>) {
    Object.assign(this, transaction);
  }
}
