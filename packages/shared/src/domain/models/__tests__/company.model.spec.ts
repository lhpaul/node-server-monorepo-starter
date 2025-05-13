import { Company } from '../company.model';

describe(Company.name, () => {
  const initialValues = {
    id: 'comp-123',
    name: 'Test Company',
  };
  let company: Company;

  beforeEach(() => {
    company = new Company(initialValues);
  });

  describe('Initialization', () => {
    it('should create a new company instance', () => {
      expect(company).toBeInstanceOf(Company);
    });

    it('should initialize with correct values', () => {
      expect(company.id).toBe(initialValues.id);
      expect(company.name).toBe(initialValues.name);
    });

    it('should handle partial initialization', () => {
      const partialCompany = new Company({ name: 'Partial Company' });
      expect(partialCompany.name).toBe('Partial Company');
      expect(partialCompany.id).toBeUndefined();
    });
  });

  describe('Property Assignment', () => {
    it('should assign and retrieve id correctly', () => {
      const testId = 'comp-456';
      company.id = testId;
      expect(company.id).toBe(testId);
    });

    it('should assign and retrieve name correctly', () => {
      const testName = 'Updated Company Name';
      company.name = testName;
      expect(company.name).toBe(testName);
    });
  });
});
