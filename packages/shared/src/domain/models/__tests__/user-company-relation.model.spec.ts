import { UserCompanyRelation, UserCompanyRole } from '../user-company-relation.model';

describe(UserCompanyRelation.name, () => {
  const initialValues = {
    companyId: 'comp-123',
    createdAt: new Date(),
    id: 'rel-123',
    role: UserCompanyRole.ADMIN,
    updatedAt: new Date(),
    userId: 'user-123',
  };
  let userCompanyRelation: UserCompanyRelation;

  beforeEach(() => {
    userCompanyRelation = new UserCompanyRelation(initialValues);
  });

  describe('Initialization', () => {
    it('should create a new user company relation instance', () => {
      expect(userCompanyRelation).toBeInstanceOf(UserCompanyRelation);
    });

    it('should initialize with correct values', () => {
      expect(userCompanyRelation.companyId).toBe(initialValues.companyId);
      expect(userCompanyRelation.createdAt).toBe(initialValues.createdAt);
      expect(userCompanyRelation.id).toBe(initialValues.id);
      expect(userCompanyRelation.role).toBe(initialValues.role);
      expect(userCompanyRelation.updatedAt).toBe(initialValues.updatedAt);
      expect(userCompanyRelation.userId).toBe(initialValues.userId);
    });
  });
});
