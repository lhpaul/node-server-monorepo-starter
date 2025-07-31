// Internal modules (farthest path first, then alphabetical)
import { Company, FinancialInstitution } from '../../domain';
import { ExecutionLogger } from '../../definitions';
import {
  CompaniesRepository,
  CompanyFinancialInstitutionRelationsRepository,
  FinancialInstitutionsRepository,
  CompanyDocument,
  CreateCompanyDocumentInput,
  QueryCompaniesInput,
  UpdateCompanyDocumentInput,
} from '../../repositories';
import { DomainModelService } from '../../utils/services';
import { encryptText } from '../../utils/encryption';

// Local imports (alphabetical)
import {
  ADD_FINANCIAL_INSTITUTION_ERRORS_MESSAGES,
  ADD_FINANCIAL_INSTITUTION_STEPS,
  LIST_FINANCIAL_INSTITUTIONS_STEPS,
  REMOVE_FINANCIAL_INSTITUTION_ERRORS_MESSAGES,
  REMOVE_FINANCIAL_INSTITUTION_STEPS,
  UPDATE_FINANCIAL_INSTITUTION_ERRORS_MESSAGES,
  UPDATE_FINANCIAL_INSTITUTION_STEPS,
} from './companies.service.constants';
import {
  AddFinancialInstitutionError,
  AddFinancialInstitutionErrorCode,
  RemoveFinancialInstitutionError,
  RemoveFinancialInstitutionErrorCode,
  UpdateFinancialInstitutionError,
  UpdateFinancialInstitutionErrorCode,
} from './companies.service.errors';
import {
  AddFinancialInstitutionInput,
  CreateCompanyInput,
  FilterCompaniesInput,
  RemoveFinancialInstitutionInput,
  UpdateCompanyInput,
  UpdateFinancialInstitutionInput,
} from './companies.service.interfaces';

export class CompaniesService extends DomainModelService<Company, CompanyDocument, CreateCompanyInput, CreateCompanyDocumentInput, UpdateCompanyInput, UpdateCompanyDocumentInput, FilterCompaniesInput, QueryCompaniesInput> {
  private static instance: CompaniesService;

  public static getInstance(): CompaniesService {
    if (!this.instance) {
      this.instance = new CompaniesService(CompaniesRepository.getInstance());
    }
    return this.instance;
  }

  /**
   * Adds a financial institution to a company with encrypted credentials
   * @param companyId - The ID of the company
   * @param input - The input containing financial institution ID and credentials
   * @param logger - Logger instance for tracking execution
   * @returns Promise resolving to the ID of the created company financial institution relation
   */
  public async addFinancialInstitution(
    companyId: string,
    input: AddFinancialInstitutionInput,
    logger: ExecutionLogger
  ): Promise<string> {
    const logGroup = `${this.constructor.name}.${this.addFinancialInstitution.name}`;
    let credentialsString: string;
    try {
      credentialsString = JSON.stringify(input.credentials);
    } catch (error) {
      throw new AddFinancialInstitutionError({ code: AddFinancialInstitutionErrorCode.INVALID_CREDENTIALS_FORMAT, message: ADD_FINANCIAL_INSTITUTION_ERRORS_MESSAGES.INVALID_CREDENTIALS_FORMAT});
    }
    
    logger.startStep(ADD_FINANCIAL_INSTITUTION_STEPS.CHECK_EXISTING_RELATION, logGroup);
    const existingRelations = await CompanyFinancialInstitutionRelationsRepository.getInstance().getDocumentsList({
      companyId: [{ value: companyId, operator: '==' }],
      financialInstitutionId: [{ value: input.financialInstitutionId, operator: '==' }],
    }, logger).finally(() => logger.endStep(ADD_FINANCIAL_INSTITUTION_STEPS.CHECK_EXISTING_RELATION));

    if (existingRelations.length > 0) {
      throw new AddFinancialInstitutionError({ 
        code: AddFinancialInstitutionErrorCode.RELATION_ALREADY_EXISTS, 
        message: ADD_FINANCIAL_INSTITUTION_ERRORS_MESSAGES.RELATION_ALREADY_EXISTS 
      });
    }
    
    logger.startStep(ADD_FINANCIAL_INSTITUTION_STEPS.ENCRYPT_CREDENTIALS, logGroup);
    const encryptedCredentials = encryptText(credentialsString);
    logger.endStep(ADD_FINANCIAL_INSTITUTION_STEPS.ENCRYPT_CREDENTIALS);

    logger.startStep(ADD_FINANCIAL_INSTITUTION_STEPS.CREATE_RELATION, logGroup);
    const relationId = await CompanyFinancialInstitutionRelationsRepository.getInstance().createDocument({
      companyId,
      financialInstitutionId: input.financialInstitutionId,
      encryptedCredentials,
    }, logger).finally(() => logger.endStep(ADD_FINANCIAL_INSTITUTION_STEPS.CREATE_RELATION));

    return relationId;
  }

  /**
   * Updates a financial institution relation for a company with new encrypted credentials
   * @param companyId - The ID of the company
   * @param input - The input containing financial institution ID and new credentials
   * @param logger - Logger instance for tracking execution
   * @returns Promise resolving when the update is complete
   */
  public async updateFinancialInstitution(
    companyId: string,
    input: UpdateFinancialInstitutionInput,
    logger: ExecutionLogger
  ): Promise<void> {
    const logGroup = `${this.constructor.name}.${this.updateFinancialInstitution.name}`;
    let credentialsString: string;
    try {
      credentialsString = JSON.stringify(input.credentials);
    } catch (error) {
      throw new UpdateFinancialInstitutionError({ code: UpdateFinancialInstitutionErrorCode.INVALID_CREDENTIALS_FORMAT, message: UPDATE_FINANCIAL_INSTITUTION_ERRORS_MESSAGES.INVALID_CREDENTIALS_FORMAT});
    }
    
    logger.startStep(UPDATE_FINANCIAL_INSTITUTION_STEPS.FIND_RELATION, logGroup);
    const relations = await CompanyFinancialInstitutionRelationsRepository.getInstance().getDocumentsList({
      companyId: [{ value: companyId, operator: '==' }],
      financialInstitutionId: [{ value: input.financialInstitutionId, operator: '==' }],
    }, logger).finally(() => logger.endStep(UPDATE_FINANCIAL_INSTITUTION_STEPS.FIND_RELATION));

    if (relations.length === 0) {
      throw new UpdateFinancialInstitutionError({ 
        code: UpdateFinancialInstitutionErrorCode.RELATION_NOT_FOUND, 
        message: UPDATE_FINANCIAL_INSTITUTION_ERRORS_MESSAGES.RELATION_NOT_FOUND 
      });
    }
    
    logger.startStep(UPDATE_FINANCIAL_INSTITUTION_STEPS.ENCRYPT_CREDENTIALS, logGroup);
    const encryptedCredentials = encryptText(credentialsString);
    logger.endStep(UPDATE_FINANCIAL_INSTITUTION_STEPS.ENCRYPT_CREDENTIALS);

    logger.startStep(UPDATE_FINANCIAL_INSTITUTION_STEPS.UPDATE_RELATION, logGroup);
    await CompanyFinancialInstitutionRelationsRepository.getInstance().updateDocument(relations[0].id, {
      encryptedCredentials,
    }, logger).finally(() => logger.endStep(UPDATE_FINANCIAL_INSTITUTION_STEPS.UPDATE_RELATION));
  }

  /**
   * Removes a financial institution from a company
   * @param companyId - The ID of the company
   * @param input - The input containing financial institution ID to remove
   * @param logger - Logger instance for tracking execution
   * @returns Promise resolving when the removal is complete
   */
  public async removeFinancialInstitution(
    companyId: string,
    input: RemoveFinancialInstitutionInput,
    logger: ExecutionLogger
  ): Promise<void> {
    const logGroup = `${this.constructor.name}.${this.removeFinancialInstitution.name}`;

    logger.startStep(REMOVE_FINANCIAL_INSTITUTION_STEPS.FIND_RELATION, logGroup);
    const relations = await CompanyFinancialInstitutionRelationsRepository.getInstance().getDocumentsList({
      companyId: [{ value: companyId, operator: '==' }],
      financialInstitutionId: [{ value: input.financialInstitutionId, operator: '==' }],
    }, logger).finally(() => logger.endStep(REMOVE_FINANCIAL_INSTITUTION_STEPS.FIND_RELATION));

    if (relations.length === 0) {
      throw new RemoveFinancialInstitutionError({ 
        code: RemoveFinancialInstitutionErrorCode.RELATION_NOT_FOUND, 
        message: REMOVE_FINANCIAL_INSTITUTION_ERRORS_MESSAGES.RELATION_NOT_FOUND 
      });
    }

    logger.startStep(REMOVE_FINANCIAL_INSTITUTION_STEPS.DELETE_RELATION, logGroup);
    await CompanyFinancialInstitutionRelationsRepository.getInstance().deleteDocument(relations[0].id, logger)
      .finally(() => logger.endStep(REMOVE_FINANCIAL_INSTITUTION_STEPS.DELETE_RELATION));
  }

  /**
   * Lists all financial institutions related to a company
   * @param companyId - The ID of the company
   * @param logger - Logger instance for tracking execution
   * @returns Promise resolving to an array of FinancialInstitution objects
   */
  public async listFinancialInstitutions(
    companyId: string,
    logger: ExecutionLogger
  ): Promise<FinancialInstitution[]> {
    const logGroup = `${this.constructor.name}.${this.listFinancialInstitutions.name}`;

    logger.startStep(LIST_FINANCIAL_INSTITUTIONS_STEPS.GET_RELATIONS, logGroup);
    const relations = await CompanyFinancialInstitutionRelationsRepository.getInstance().getDocumentsList({
      companyId: [{ value: companyId, operator: '==' }],
    }, logger).finally(() => logger.endStep(LIST_FINANCIAL_INSTITUTIONS_STEPS.GET_RELATIONS));

    if (relations.length === 0) {
      return [];
    }

    logger.startStep(LIST_FINANCIAL_INSTITUTIONS_STEPS.GET_FINANCIAL_INSTITUTIONS, logGroup);
    const financialInstitutionIds = relations.map(relation => relation.financialInstitutionId);
    const financialInstitutions: FinancialInstitution[] = [];

    try {
      for (const financialInstitutionId of financialInstitutionIds) {
        const financialInstitutionDoc = await FinancialInstitutionsRepository.getInstance().getDocument(financialInstitutionId, logger);
        if (financialInstitutionDoc) {
          financialInstitutions.push(new FinancialInstitution(financialInstitutionDoc));
        }
      }
    } finally {
      logger.endStep(LIST_FINANCIAL_INSTITUTIONS_STEPS.GET_FINANCIAL_INSTITUTIONS);
    }

    return financialInstitutions;
  }
}