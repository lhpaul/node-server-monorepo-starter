import { FinancialInstitution } from '../financial-institution.model';

describe(FinancialInstitution.name, () => {
  const initialValues = {
    id: 'fi-001',
    name: 'Test Bank',
    countryCode: 'US',
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-06-01T00:00:00Z'),
  };
  let financialInstitution: FinancialInstitution;

  beforeEach(() => {
    financialInstitution = new FinancialInstitution(initialValues as Required<FinancialInstitution>);
  });

  describe('Initialization', () => {
    it('should create a new FinancialInstitution instance', () => {
      expect(financialInstitution).toBeInstanceOf(FinancialInstitution);
    });

    it('should initialize with correct values', () => {
      expect(financialInstitution.id).toBe(initialValues.id);
      expect(financialInstitution.name).toBe(initialValues.name);
      expect(financialInstitution.countryCode).toBe(initialValues.countryCode);
      expect(financialInstitution.createdAt).toEqual(initialValues.createdAt);
      expect(financialInstitution.updatedAt).toEqual(initialValues.updatedAt);
    });
  });
}); 