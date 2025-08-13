// Internal modules (farthest path first, then alphabetical)
import { FinancialInstitution } from '../..';
import {
  CreateFinancialInstitutionDocumentInput,
  FinancialInstitutionDocument,
  FinancialInstitutionsRepository,
  QueryFinancialInstitutionsInput,
  UpdateFinancialInstitutionDocumentInput,
} from '../../../repositories';
import { DomainModelService } from '../../../utils/services';

// Local imports (alphabetical)
import {
  CreateFinancialInstitutionInput,
  FilterFinancialInstitutionsInput,
  UpdateFinancialInstitutionInput,
} from './financial-institutions.service.interfaces';

export class FinancialInstitutionsService extends DomainModelService<FinancialInstitution, FinancialInstitutionDocument, CreateFinancialInstitutionInput, CreateFinancialInstitutionDocumentInput, UpdateFinancialInstitutionInput, UpdateFinancialInstitutionDocumentInput, FilterFinancialInstitutionsInput, QueryFinancialInstitutionsInput> {
  private static instance: FinancialInstitutionsService;
  public static getInstance(): FinancialInstitutionsService {
    if (!this.instance) {
      this.instance = new FinancialInstitutionsService();
    }
    return this.instance;
  }
  constructor() {
    super(FinancialInstitutionsRepository.getInstance(), FinancialInstitution);
  }
} 