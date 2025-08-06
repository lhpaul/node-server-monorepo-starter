// Internal modules (farthest path first, then alphabetical)
import { ExecutionLogger } from '../../definitions';
import { FinancialInstitution } from '../../domain';
import {
  CreateFinancialInstitutionDocumentInput,
  FinancialInstitutionDocument,
  FinancialInstitutionsRepository,
  QueryFinancialInstitutionsInput,
  UpdateFinancialInstitutionDocumentInput,
} from '../../repositories';
import { apiRequest, getEnvironmentVariable, getSecret } from '../../utils';
import { DomainModelService } from '../../utils/services';

// Local imports (alphabetical)
import {
  GET_TRANSACTIONS_ERROR,
  GET_TRANSACTIONS_ERROR_MESSAGE,
  HOST_BY_INSTITUTION_ID,
  MOCK_API_PROJECT_SECRET_KEY,
  MOCK_TRANSACTIONS_ENDPOINT_ENV_VARIABLE_KEY,
  STEPS,
} from './financial-institutions.service.constants';
import {
  CreateFinancialInstitutionInput,
  FilterFinancialInstitutionsInput,
  FinancialInstitutionConfig,
  GetTransactionsInput,
  UpdateFinancialInstitutionInput,
} from './financial-institutions.service.interfaces';
import { FinancialInstitutionTransaction } from './financial-institutions.service.models';

/*
 This is just a mock service for simulating financial institution APIs or scrapers.
 It uses the mockapi.io API to get transactions.
 It intentionally uses environment variables and secrets as examples of how to use them in a service.
*/
export class FinancialInstitutionsService extends DomainModelService<FinancialInstitution, FinancialInstitutionDocument, CreateFinancialInstitutionInput, CreateFinancialInstitutionDocumentInput, UpdateFinancialInstitutionInput, UpdateFinancialInstitutionDocumentInput, FilterFinancialInstitutionsInput, QueryFinancialInstitutionsInput> {
  private static instances: Map<string, FinancialInstitutionsService> = new Map();
  public static getInstance(financialInstitutionId: string): FinancialInstitutionsService {
    if (!this.instances.has(financialInstitutionId)) {
      this.instances.set(financialInstitutionId, new FinancialInstitutionsService({
        financialInstitutionId,
      }));
    }
    return this.instances.get(financialInstitutionId) as FinancialInstitutionsService;
  }
  constructor(private readonly _config: FinancialInstitutionConfig) {
    super(FinancialInstitutionsRepository.getInstance(), FinancialInstitution);
    this._config = _config;
  }

  public async getTransactions(input: GetTransactionsInput, logger: ExecutionLogger): Promise<FinancialInstitutionTransaction[]> {
    const logGroup = `${FinancialInstitutionsService.name}.${this.getTransactions.name}`;
    logger.startStep(STEPS.GET_TRANSACTIONS.id, logGroup);

    const transactionsEndpoint = getEnvironmentVariable(MOCK_TRANSACTIONS_ENDPOINT_ENV_VARIABLE_KEY);
    const projectSecret = getSecret(MOCK_API_PROJECT_SECRET_KEY);
    const result = await apiRequest<FinancialInstitutionTransaction[]>({
      method: 'GET',
      url: `${projectSecret}.${HOST_BY_INSTITUTION_ID[this._config.financialInstitutionId]}/${transactionsEndpoint}?sortBy=createdAt&order=desc`,
    }, logger).finally(() => logger.endStep(STEPS.GET_TRANSACTIONS.id));

    if (result.error) {
      logger.warn({
        logId: GET_TRANSACTIONS_ERROR.logId,
        financialInstitutionId: this._config.financialInstitutionId,
        error: result.error,
      }, GET_TRANSACTIONS_ERROR.logMessage);

      throw new Error(`${GET_TRANSACTIONS_ERROR_MESSAGE}: message: ${result.error.message}, code: ${result.error.code}`);
    }

    // we must filter in memory since mockapi.io does not support filtering by date
    const fromDate = new Date(input.fromDate);
    const toDate = new Date(input.toDate);
    if (result.data && result.data.length > 0) {
      const filteredTransactions = [];
      for (const transaction of result.data) { // there are sorted by createdAt in descending order
        const transactionDate = new Date(transaction.createdAt);
        if (transactionDate > toDate) {
          break;
        }
        if (transactionDate >= fromDate) {
          filteredTransactions.push(transaction);
        }
      }
      return filteredTransactions;
    }
    return [];
  }
} 