import { InMemoryRepository } from '../../utils/repositories/in-memory-repository.class';
import { MOCK_FINANCIAL_INSTITUTIONS } from './financial-institutions.repository.constants';
import {
  FinancialInstitutionDocument,
  CreateFinancialInstitutionDocumentInput,
  QueryFinancialInstitutionsInput,
  UpdateFinancialInstitutionDocumentInput,
} from './financial-institutions.repository.interfaces';

export class FinancialInstitutionsRepository extends InMemoryRepository<FinancialInstitutionDocument, CreateFinancialInstitutionDocumentInput, UpdateFinancialInstitutionDocumentInput, QueryFinancialInstitutionsInput> {
  private static instance: FinancialInstitutionsRepository;

  public static getInstance(): FinancialInstitutionsRepository {
    if (!FinancialInstitutionsRepository.instance) {
      FinancialInstitutionsRepository.instance = new FinancialInstitutionsRepository(MOCK_FINANCIAL_INSTITUTIONS);
    }
    return FinancialInstitutionsRepository.instance;
  }
} 