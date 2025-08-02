import { CompanyDocument } from './companies.repository.interfaces';

export const MOCK_COMPANIES: CompanyDocument[] = [
  { createdAt: new Date(), id: '0', name: 'Acme Corp', countryCode: 'US', updatedAt: new Date() },
  { createdAt: new Date(), id: '1', name: 'TechStart Inc', countryCode: 'CA', updatedAt: new Date() },
  { createdAt: new Date(), id: '2', name: 'Global Solutions Ltd', countryCode: 'GB', updatedAt: new Date() },
];
