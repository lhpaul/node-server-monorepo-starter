import { FinancialInstitutionDocument } from './financial-institutions.repository.interfaces';

export const MOCK_FINANCIAL_INSTITUTIONS: FinancialInstitutionDocument[] = [
  {
    id: '0',
    name: 'Bank of America',
    countryCode: 'US',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  },
  {
    id: '1',
    name: 'Chase Bank',
    countryCode: 'US',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  },
  {
    id: '2',
    name: 'Wells Fargo',
    countryCode: 'US',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  },
  {
    id: '3',
    name: 'Bank of Canada',
    countryCode: 'CA',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  },
]; 