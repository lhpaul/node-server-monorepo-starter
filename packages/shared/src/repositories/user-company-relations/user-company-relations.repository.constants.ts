import { UserCompanyRelationDocument } from './user-company-relations.repository.interfaces';

export const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'Related user not found',
  COMPANY_NOT_FOUND: 'Related company not found',
}

export const MOCK_USER_COMPANY_RELATIONS: UserCompanyRelationDocument[] = [
  {
    id: '0',
    companyId: '0',
    userId: '0',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '1',
    companyId: '1',
    userId: '0',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    companyId: '0',
    userId: '1',
    role: 'member',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
