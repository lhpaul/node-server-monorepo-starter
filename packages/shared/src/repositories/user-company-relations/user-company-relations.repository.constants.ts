import { UserCompanyRelation, UserCompanyRole } from '../../domain/models/user-company-relation.model';

export const MOCK_USER_COMPANY_RELATIONS: UserCompanyRelation[] = [
  new UserCompanyRelation({
    id: '0',
    companyId: '0',
    userId: '0',
    role: UserCompanyRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  new UserCompanyRelation({
    id: '1',
    companyId: '1',
    userId: '0',
    role: UserCompanyRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  new UserCompanyRelation({
    id: '2',
    companyId: '0',
    userId: '1',
    role: UserCompanyRole.MEMBER,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
];

export const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'Related user not found',
  COMPANY_NOT_FOUND: 'Related company not found',
}
