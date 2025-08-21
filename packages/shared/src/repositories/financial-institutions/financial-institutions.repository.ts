import { FirestoreCollectionRepository } from '../../utils/repositories';
import { COLLECTION_PATH } from './financial-institutions.repository.constants';
import {
  FinancialInstitutionDocument,
  CreateFinancialInstitutionDocumentInput,
  QueryFinancialInstitutionsInput,
  UpdateFinancialInstitutionDocumentInput,
} from './financial-institutions.repository.interfaces';

export class FinancialInstitutionsRepository extends FirestoreCollectionRepository<FinancialInstitutionDocument, CreateFinancialInstitutionDocumentInput, UpdateFinancialInstitutionDocumentInput, QueryFinancialInstitutionsInput> {
  static readonly COLLECTION_PATH = COLLECTION_PATH;
  private static instance: FinancialInstitutionsRepository;

  public static getInstance(): FinancialInstitutionsRepository {
    if (!FinancialInstitutionsRepository.instance) {
      FinancialInstitutionsRepository.instance = new FinancialInstitutionsRepository();
    }
    return FinancialInstitutionsRepository.instance;
  }
  constructor() {
    super({
      collectionPath: COLLECTION_PATH
    });
  }
} 