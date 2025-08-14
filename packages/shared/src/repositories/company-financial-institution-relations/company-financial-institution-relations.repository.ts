import { ExecutionLogger } from '../../definitions';
import { InMemoryRepository } from '../../utils/repositories/in-memory-repository.class';
import { RepositoryError, RepositoryErrorCode } from '../../utils/repositories/repositories.errors';
import { CompaniesRepository } from '../companies/companies.repository';
import { FinancialInstitutionsRepository } from '../financial-institutions/financial-institutions.repository';
import {
  ERROR_MESSAGES,
  MOCK_COMPANY_FINANCIAL_INSTITUTION_RELATIONS,
  STEPS,
} from './company-financial-institution-relations.repository.constants';
import {
  CompanyFinancialInstitutionRelationDocument,
  CreateCompanyFinancialInstitutionRelationDocumentInput,
  QueryCompanyFinancialInstitutionRelationsInput,
  UpdateCompanyFinancialInstitutionRelationDocumentInput,
} from './company-financial-institution-relations.repository.interfaces';

export class CompanyFinancialInstitutionRelationsRepository extends InMemoryRepository<CompanyFinancialInstitutionRelationDocument, CreateCompanyFinancialInstitutionRelationDocumentInput, UpdateCompanyFinancialInstitutionRelationDocumentInput, QueryCompanyFinancialInstitutionRelationsInput> {
  private static instance: CompanyFinancialInstitutionRelationsRepository;

  public static getInstance(): CompanyFinancialInstitutionRelationsRepository {
    if (!CompanyFinancialInstitutionRelationsRepository.instance) {
      CompanyFinancialInstitutionRelationsRepository.instance = new CompanyFinancialInstitutionRelationsRepository(MOCK_COMPANY_FINANCIAL_INSTITUTION_RELATIONS);
    }
    return CompanyFinancialInstitutionRelationsRepository.instance;
  }

  /**
   * Creates a new company financial institution relation
   * @param data - The data to create the new company financial institution relation with
   * @param logger - Logger instance for tracking execution
   * @returns Promise resolving to the ID of the created company financial institution relation
   * @throws RepositoryError with code {@link RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND} if the related company or financial institution is not found
   */
  async createDocument(data: CreateCompanyFinancialInstitutionRelationDocumentInput, logger: ExecutionLogger): Promise<string> {
    const logGroup = `${this.constructor.name}.${this.createDocument.name}`;
    logger.startStep(STEPS.GET_RELATED_DOCUMENTS, logGroup);
    const { companyId, financialInstitutionId } = data;
    const [company, financialInstitution] = await Promise.all([
      CompaniesRepository.getInstance().getDocument(companyId, logger),
      FinancialInstitutionsRepository.getInstance().getDocument(financialInstitutionId, logger),
    ]).finally(() => logger.endStep(STEPS.GET_RELATED_DOCUMENTS));
    if (!company) {
      throw new RepositoryError({ code: RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND, message: ERROR_MESSAGES.COMPANY_NOT_FOUND, data: { companyId } });
    }
    if (!financialInstitution) {
      throw new RepositoryError({ code: RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND, message: ERROR_MESSAGES.FINANCIAL_INSTITUTION_NOT_FOUND, data: { financialInstitutionId } });
    }
    return super.createDocument(data, logger);
  }
} 