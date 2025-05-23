import { UserCompanyRelation, UserCompanyRole } from '../../domain/models/user-company-relation.model';
import { UpdateUserCompanyRelationErrorCode } from './user-company-relations.repository.errors';

export const MOCK_USER_COMPANY_RELATIONS: UserCompanyRelation[] = [
  new UserCompanyRelation({
    id: '1',
    companyId: '1',
    userId: '1',
    role: UserCompanyRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  new UserCompanyRelation({
    id: '2',
    companyId: '2',
    userId: '1',
    role: UserCompanyRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  new UserCompanyRelation({
    id: '3',
    companyId: '1',
    userId: '2',
    role: UserCompanyRole.MEMBER,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
];

export const ERROR_MESSAGES = {
  [UpdateUserCompanyRelationErrorCode.NOT_FOUND]: 'User company relation not found',
}; 