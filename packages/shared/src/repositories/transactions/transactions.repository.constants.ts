import { TransactionDocument } from './transactions.repository.interfaces';

export const ERROR_MESSAGES = {
  COMPANY_NOT_FOUND: 'Related company not found',
}

export const MOCK_TRANSACTIONS: TransactionDocument[] = [
  {
    amount: 100,
    companyId: '0',
    createdAt: new Date(),
    date: '2021-01-01',
    id: '0',
    type: 'credit',
    updatedAt: new Date(),
  },
  {
    amount: 200,
    companyId: '0',
    createdAt: new Date(),
    date: '2021-01-02',
    id: '1',
    type: 'debit',
    updatedAt: new Date(),
  },
  {
    amount: 300,
    companyId: '1',
    createdAt: new Date(),
    date: '2021-01-03',
    id: '2',
    type: 'credit',
    updatedAt: new Date(),
  },
];
