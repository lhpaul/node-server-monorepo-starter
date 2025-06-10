import { Company } from '../../domain/models/company.model';
import { InMemoryRepository } from '../../utils/repositories/in-memory-repository.class';
import { MOCK_COMPANIES } from './companies.repository.constants';
import {
  CreateCompanyDocumentInput,
  QueryCompaniesInput,
  UpdateCompanyDocumentInput,
} from './companies.repository.interfaces';


export class CompaniesRepository extends InMemoryRepository<Company, CreateCompanyDocumentInput, UpdateCompanyDocumentInput, QueryCompaniesInput> {
  private static instance: CompaniesRepository;

  public static getInstance(): CompaniesRepository {
    if (!CompaniesRepository.instance) {
      CompaniesRepository.instance = new CompaniesRepository(MOCK_COMPANIES);
    }
    return CompaniesRepository.instance;
  }
}
