import { FirestoreCollectionRepository } from '../../utils/repositories';
import { COLLECTION_PATH } from './companies.repository.constants';
import {
  CompanyDocument,
  CreateCompanyDocumentInput,
  QueryCompaniesInput,
  UpdateCompanyDocumentInput,
} from './companies.repository.interfaces';


export class CompaniesRepository extends FirestoreCollectionRepository<CompanyDocument, CreateCompanyDocumentInput, UpdateCompanyDocumentInput, QueryCompaniesInput> {
  private static instance: CompaniesRepository;

  public static getInstance(): CompaniesRepository {
    if (!CompaniesRepository.instance) {
      CompaniesRepository.instance = new CompaniesRepository();
    }
    return CompaniesRepository.instance;
  }
  constructor() {
    super({
      collectionPath: COLLECTION_PATH
    });
  }
}
