import {
  Transaction,
  TransactionType,
} from '../../domain/models/transaction.model';

export const ERROR_MESSAGES = {
  COMPANY_NOT_FOUND: 'Related company not found',
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  new Transaction({
    amount: 100,
    companyId: '1',
    createdAt: new Date(),
    date: '2021-01-01',
    id: '0',
    type: TransactionType.CREDIT,
    updatedAt: new Date(),
  }),
  new Transaction({
    amount: 200,
    companyId: '1',
    createdAt: new Date(),
    date: '2021-01-02',
    id: '1',
    type: TransactionType.DEBIT,
    updatedAt: new Date(),
  }),
  new Transaction({
    amount: 300,
    companyId: '1',
    createdAt: new Date(),
    date: '2021-01-03',
    id: '2',
    type: TransactionType.CREDIT,
    updatedAt: new Date(),
  }),
];
