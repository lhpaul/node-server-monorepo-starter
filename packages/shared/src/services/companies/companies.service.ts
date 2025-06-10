import { Company } from '../../domain';
import {
  CompaniesRepository,
  CompanyDocument,
  CreateCompanyDocumentInput,
  QueryCompaniesInput,
  UpdateCompanyDocumentInput,
} from '../../repositories';
import { DomainModelService } from '../../utils/services';
import {
  CreateCompanyInput,
  UpdateCompanyInput,
  FilterCompaniesInput,
} from './companies.service.interfaces';

export class CompaniesService extends DomainModelService<Company, CompanyDocument, CreateCompanyInput, CreateCompanyDocumentInput, UpdateCompanyInput, UpdateCompanyDocumentInput, FilterCompaniesInput, QueryCompaniesInput> {
  private static instance: CompaniesService;

  public static getInstance(): CompaniesService {
    if (!this.instance) {
      this.instance = new CompaniesService(CompaniesRepository.getInstance());
    }
    return this.instance;
  }
}