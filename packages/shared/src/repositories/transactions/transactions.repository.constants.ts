import {
  Transaction,
  TransactionType,
} from '../../domain/models/transaction.model';
import { UpdateTransactionErrorCode } from './transactions.repository.errors';

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    amount: 100,
    date: '2021-01-01',
    id: '0',
    type: TransactionType.CREDIT,
  },
  {
    amount: 200,
    date: '2021-01-02',
    id: '1',
    type: TransactionType.DEBIT,
  },
  {
    amount: 300,
    date: '2021-01-03',
    id: '2',
    type: TransactionType.CREDIT,
  },
];

export const ERROR_MESSAGES: Record<UpdateTransactionErrorCode, string> = {
  [UpdateTransactionErrorCode.DOCUMENT_NOT_FOUND]: 'Transaction not found',
};
