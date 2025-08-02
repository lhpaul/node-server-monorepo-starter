import { Company } from '../company.model';

describe(Company.name, () => {
  const initialValues = {
    createdAt: new Date(),
    id: 'comp-123',
    name: 'Test Company',
    countryCode: 'US',
    updatedAt: new Date(),
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
      expect(company.createdAt).toBe(initialValues.createdAt);
      expect(company.id).toBe(initialValues.id);
      expect(company.name).toBe(initialValues.name);
      expect(company.countryCode).toBe(initialValues.countryCode);
      expect(company.updatedAt).toBe(initialValues.updatedAt);
    });
  });
});
