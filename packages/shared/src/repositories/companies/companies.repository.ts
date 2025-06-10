import { InMemoryRepository } from '../../utils/repositories/in-memory-repository.class';
import { MOCK_COMPANIES } from './companies.repository.constants';
import {
  CompanyDocument,
  CreateCompanyDocumentInput,
  QueryCompaniesInput,
  UpdateCompanyDocumentInput,
} from './companies.repository.interfaces';


export class CompaniesRepository extends InMemoryRepository<CompanyDocument, CreateCompanyDocumentInput, UpdateCompanyDocumentInput, QueryCompaniesInput> {
  private static instance: CompaniesRepository;

  public static getInstance(): CompaniesRepository {
    if (!CompaniesRepository.instance) {
      CompaniesRepository.instance = new CompaniesRepository(MOCK_COMPANIES);
    }
    return CompaniesRepository.instance;
  }
}
