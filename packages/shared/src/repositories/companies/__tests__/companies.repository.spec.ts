import { CompaniesRepository } from '../companies.repository';
import { MOCK_COMPANIES } from '../companies.repository.constants';
import {
  UpdateCompanyError,
  UpdateCompanyErrorCode,
  DeleteCompanyError,
  DeleteCompanyErrorCode,
} from '../companies.repository.errors';

describe(CompaniesRepository.name, () => {
  let repository: CompaniesRepository;
  const createCompanyData = {
    name: 'Test Company',
  };

  beforeEach(() => {
    // Reset the singleton instance
    (CompaniesRepository as any).instance = undefined;
    repository = CompaniesRepository.getInstance();
  });

  describe(CompaniesRepository.getInstance.name, () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = CompaniesRepository.getInstance();
      const instance2 = CompaniesRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe(CompaniesRepository.prototype.createCompany.name, () => {
    it('should create a new company and return its id', async () => {
      const result = await repository.createCompany(createCompanyData);

      expect(result).toHaveProperty('id');
    });
  });

  describe(CompaniesRepository.prototype.getCompanyById.name, () => {
    it('should return a company when it exists', async () => {
      const company = MOCK_COMPANIES[0];
      const fetchedCompany = await repository.getCompanyById(company.id);
      expect(fetchedCompany).toEqual(company);
    });

    it('should return null when company does not exist', async () => {
      const fetchedCompany = await repository.getCompanyById('999');
      expect(fetchedCompany).toBeNull();
    });
  });

  describe(CompaniesRepository.prototype.getCompanies.name, () => {
    it('should return all companies when no query is provided', async () => {
      const companies = await repository.getCompanies();
      expect(companies).toEqual(MOCK_COMPANIES);
    });

    it('should filter companies based on query', async () => {
      const companies = await repository.getCompanies({
        name: [{ operator: '==', value: MOCK_COMPANIES[0].name }],
      });
      expect(companies).toHaveLength(1);
      expect(companies[0]).toEqual(MOCK_COMPANIES[0]);
    });
  });

  describe(CompaniesRepository.prototype.updateCompany.name, () => {
    const updateData = {
      name: 'Updated Name',
    };
    it('should update an existing company', async () => {
      const companyId = MOCK_COMPANIES[0].id;
      await repository.updateCompany(companyId, updateData);
      const updatedCompany = await repository.getCompanyById(companyId);
      expect(updatedCompany?.name).toBe(updateData.name);
    });

    it('should throw UpdateCompanyError when company does not exist', async () => {
      try {
        await repository.updateCompany('999', updateData);
      } catch (error: any) {
        expect(error).toBeInstanceOf(UpdateCompanyError);
        expect(error.code).toBe(UpdateCompanyErrorCode.DOCUMENT_NOT_FOUND);
      }
    });
  });

  describe(CompaniesRepository.prototype.deleteCompany.name, () => {
    it('should delete an existing company', async () => {
      const companyId = MOCK_COMPANIES[0].id;
      await repository.deleteCompany(companyId);
      const company = await repository.getCompanyById(companyId);
      expect(company).toBeNull();
    });

    it('should throw DeleteCompanyError when company does not exist', async () => {
      try {
        await repository.deleteCompany('999');
      } catch (error: any) {
        expect(error).toBeInstanceOf(DeleteCompanyError);
        expect(error.code).toBe(DeleteCompanyErrorCode.DOCUMENT_NOT_FOUND);
      }
    });
  });
});
