import { FinancialInstitutionDocument } from './financial-institutions.repository.interfaces';

export const MOCK_FINANCIAL_INSTITUTIONS: FinancialInstitutionDocument[] = [
  {
    id: '1',
    name: 'Bank of America',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  },
  {
    id: '2',
    name: 'Chase Bank',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  },
  {
    id: '3',
    name: 'Wells Fargo',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  },
]; 