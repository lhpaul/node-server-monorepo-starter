import { CompanyFinancialInstitutionRelation } from '../company-financial-institution-relation.model';

describe(CompanyFinancialInstitutionRelation.name, () => {
  const initialValues = {
    companyId: 'comp-001',
    createdAt: new Date('2023-01-01T00:00:00Z'),
    encryptedCredentials: 'encrypted-cred',
    financialInstitutionId: 'fi-001',
    id: 'rel-001',
    updatedAt: new Date('2023-06-01T00:00:00Z'),
  };
  let relation: CompanyFinancialInstitutionRelation;

  beforeEach(() => {
    relation = new CompanyFinancialInstitutionRelation(initialValues as Required<CompanyFinancialInstitutionRelation>);
  });

  describe('Initialization', () => {
    it('should create a new CompanyFinancialInstitutionRelation instance', () => {
      expect(relation).toBeInstanceOf(CompanyFinancialInstitutionRelation);
    });

    it('should initialize with correct values', () => {
      expect(relation.companyId).toBe(initialValues.companyId);
      expect(relation.createdAt).toEqual(initialValues.createdAt);
      expect(relation.encryptedCredentials).toBe(initialValues.encryptedCredentials);
      expect(relation.financialInstitutionId).toBe(initialValues.financialInstitutionId);
      expect(relation.id).toBe(initialValues.id);
      expect(relation.updatedAt).toEqual(initialValues.updatedAt);
    });
  });
}); 