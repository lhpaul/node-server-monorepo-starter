// Internal modules (farthest path first, then alphabetical)
import { ENV_VARIABLES_KEYS, SECRETS } from '../../../constants';
import { ExecutionLogger } from '../../../definitions';
import { apiRequest, getEnvironmentVariable, getSecret } from '../../../utils';

// Local imports (alphabetical)
import {
  GET_TRANSACTIONS_ERROR,
  GET_TRANSACTIONS_ERROR_MESSAGE,
  MOCK_API_HOST,
  STEPS,
} from './financial-institution.service.constants';
import {
  FinancialInstitutionConfig,
  GetTransactionsInput,
} from './financial-institution.service.interfaces';
import { FinancialInstitutionTransaction } from './financial-institution.service.models';

/*
 This is just a mock service for simulating financial institution APIs or scrapers.
 It uses the mockapi.io API to get transactions.
 It intentionally uses environment variables and secrets as examples of how to use them in a service.
*/
export class FinancialInstitutionService {
  private static instances: Map<string, FinancialInstitutionService> = new Map();
  public static getInstance(financialInstitutionId: string): FinancialInstitutionService {
    if (!this.instances.has(financialInstitutionId)) {
      this.instances.set(financialInstitutionId, new FinancialInstitutionService({
        financialInstitutionId,
      }));
    }
    return this.instances.get(financialInstitutionId) as FinancialInstitutionService;
  }
  constructor(private readonly _config: FinancialInstitutionConfig) {
    this._config = _config;
  }

  /**
   * Get transactions from the financial institution
   * @param input - The {@link GetTransactionsInput} for the get transactions operation
   * @param logger - The {@link ExecutionLogger} to use for logging
   * @returns The {@link FinancialInstitutionTransaction}s from the financial institution
   */
  public async getTransactions(input: GetTransactionsInput, logger: ExecutionLogger): Promise<FinancialInstitutionTransaction[]> {
    const logGroup = `${FinancialInstitutionService.name}.${this.getTransactions.name}`;
    logger.startStep(STEPS.GET_TRANSACTIONS, logGroup);

    const transactionsEndpoint = getEnvironmentVariable(ENV_VARIABLES_KEYS.MOCK_TRANSACTIONS_ENDPOINT);
    const projectSecret = getSecret(SECRETS.MOCK_API_PROJECT_SECRET);
    const result = await apiRequest<FinancialInstitutionTransaction[]>({
      method: 'GET',
      url: `https://${projectSecret}.${MOCK_API_HOST}/${transactionsEndpoint}?sortBy=createdAt&order=desc`,
    }, logger).finally(() => logger.endStep(STEPS.GET_TRANSACTIONS));

    if (result.error) {
      logger.warn({
        logId: GET_TRANSACTIONS_ERROR.logId,
        financialInstitutionId: this._config.financialInstitutionId,
        error: result.error,
      }, GET_TRANSACTIONS_ERROR.logMessage);

      throw new Error(GET_TRANSACTIONS_ERROR_MESSAGE(result.error.code, result.error.message));
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
          filteredTransactions.push({
            ...transaction,
            amount: Number(transaction.amount),
          });
        }
      }
      return filteredTransactions;
    }
    return [];
  }
} 