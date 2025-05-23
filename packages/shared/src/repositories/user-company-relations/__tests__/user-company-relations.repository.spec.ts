import { UserCompanyRole } from '../../../domain/models/user-company-relation.model';
import { UserCompanyRelationsRepository } from '../user-company-relations.repository';
import { MOCK_USER_COMPANY_RELATIONS } from '../user-company-relations.repository.constants';
import {
  UpdateUserCompanyRelationError,
  UpdateUserCompanyRelationErrorCode,
  DeleteUserCompanyRelationError,
  DeleteUserCompanyRelationErrorCode,
} from '../user-company-relations.repository.errors';

describe(UserCompanyRelationsRepository.name, () => {
  let repository: UserCompanyRelationsRepository;
  const createRelationData = {
    companyId: '3',
    userId: '3',
    role: UserCompanyRole.MEMBER,
  };

  beforeEach(() => {
    // Reset the singleton instance
    (UserCompanyRelationsRepository as any).instance = undefined;
    repository = UserCompanyRelationsRepository.getInstance();
  });

  describe(UserCompanyRelationsRepository.getInstance.name, () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = UserCompanyRelationsRepository.getInstance();
      const instance2 = UserCompanyRelationsRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe(UserCompanyRelationsRepository.prototype.createUserCompanyRelation.name, () => {
    it('should create a new relation and return its id', async () => {
      const result = await repository.createUserCompanyRelation(createRelationData);
      expect(result).toHaveProperty('id');
    });
  });

  describe(UserCompanyRelationsRepository.prototype.getUserCompanyRelationById.name, () => {
    it('should return a relation when it exists', async () => {
      const relation = MOCK_USER_COMPANY_RELATIONS[0];
      const fetchedRelation = await repository.getUserCompanyRelationById(relation.id);
      expect(fetchedRelation).toEqual(relation);
    });

    it('should return null when relation does not exist', async () => {
      const fetchedRelation = await repository.getUserCompanyRelationById('999');
      expect(fetchedRelation).toBeNull();
    });
  });

  describe(UserCompanyRelationsRepository.prototype.getUserCompanyRelations.name, () => {
    it('should return all relations when no query is provided', async () => {
      const relations = await repository.getUserCompanyRelations();
      expect(relations).toEqual(MOCK_USER_COMPANY_RELATIONS);
    });

    it('should filter relations by companyId', async () => {
      const relations = await repository.getUserCompanyRelations({
        companyId: [{ operator: '==', value: '1' }],
      });
      expect(relations).toHaveLength(2);
      expect(relations.every((r) => r.companyId === '1')).toBe(true);
    });

    it('should filter relations by userId', async () => {
      const relations = await repository.getUserCompanyRelations({
        userId: [{ operator: '==', value: '1' }],
      });
      expect(relations).toHaveLength(2);
      expect(relations.every((r) => r.userId === '1')).toBe(true);
    });

    it('should filter relations by role', async () => {
      const relations = await repository.getUserCompanyRelations({
        role: [{ operator: '==', value: UserCompanyRole.ADMIN }],
      });
      expect(relations).toHaveLength(2);
      expect(relations.every((r) => r.role === UserCompanyRole.ADMIN)).toBe(true);
    });
  });

  describe(UserCompanyRelationsRepository.prototype.updateUserCompanyRelation.name, () => {
    it('should update an existing relation', async () => {
      const relation = MOCK_USER_COMPANY_RELATIONS[0];
      const newRole = UserCompanyRole.MEMBER;
      await repository.updateUserCompanyRelation(relation.id, { role: newRole });
      const updatedRelation = await repository.getUserCompanyRelationById(relation.id);
      expect(updatedRelation?.role).toBe(newRole);
    });

    it('should throw UpdateUserCompanyRelationError when relation does not exist', async () => {
      try {
        await repository.updateUserCompanyRelation('999', { role: UserCompanyRole.MEMBER });
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeInstanceOf(UpdateUserCompanyRelationError);
        expect(error.code).toBe(UpdateUserCompanyRelationErrorCode.NOT_FOUND);
      }
    });
  });

  describe(UserCompanyRelationsRepository.prototype.deleteUserCompanyRelation.name, () => {
    it('should delete an existing relation', async () => {
      const relation = MOCK_USER_COMPANY_RELATIONS[0];
      await repository.deleteUserCompanyRelation(relation.id);
      const deletedRelation = await repository.getUserCompanyRelationById(relation.id);
      expect(deletedRelation).toBeNull();
    });

    it('should throw DeleteUserCompanyRelationError when relation does not exist', async () => {
      try {
        await repository.deleteUserCompanyRelation('999');
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeInstanceOf(DeleteUserCompanyRelationError);
        expect(error.code).toBe(DeleteUserCompanyRelationErrorCode.NOT_FOUND);
      }
    });
  });
}); 