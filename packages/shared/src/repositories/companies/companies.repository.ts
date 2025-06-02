import { Company } from '../../domain/models/company.model';
import { FirestoreCollectionRepository } from '../../utils/firestore/firestore-collection-repository.class';
import { COLLECTION_PATH } from './companies.repository.constants';
import {
  CreateCompanyBody,
  GetCompaniesQuery,
  UpdateCompanyBody,
} from './companies.repository.interfaces';


export class CompaniesRepository extends FirestoreCollectionRepository<Company, CreateCompanyBody, UpdateCompanyBody, GetCompaniesQuery> {
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
