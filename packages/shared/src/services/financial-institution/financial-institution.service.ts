import { ExecutionLogger } from '../../definitions'
import { apiRequest, getEnvironmentVariable, getSecret } from '../../utils';
import {
  GET_TRANSACTIONS_ERROR_MESSAGE,
  HOST_BY_INSTITUTION_ID,
  MOCK_API_PROJECT_SECRET_KEY,
  MOCK_TRANSACTIONS_ENDPOINT_ENV_VARIABLE_KEY,
} from './financial-institution.service.constants';
import { FinancialInstitutionConfig, GetTransactionsInput } from './financial-institution.service.interfaces';
import { FinancialInstitutionTransaction } from './financial-institution.service.models';

/*
 This is just a mock service for simulating financial institution APIs or scrapers.
 It uses the mockapi.io API to get transactions.
 It intentionally uses environment variables and secrets as examples of how to use them in a service.
*/
export class FinancialInstitutionsService {
  private static instances: Map<string, FinancialInstitutionsService> = new Map();
  public static getInstance(financialInstitutionId: string): FinancialInstitutionsService {
    if (!this.instances.has(financialInstitutionId)) {
      this.instances.set(financialInstitutionId, new FinancialInstitutionsService({
        financialInstitutionId,
      }));
    }
    return this.instances.get(financialInstitutionId) as FinancialInstitutionsService;
  }
  private readonly _projectSecret: string;
  constructor(private readonly _config: FinancialInstitutionConfig) {
    this._config = _config;
    this._projectSecret = getSecret(MOCK_API_PROJECT_SECRET_KEY);
  }

  public async getTransactions(input: GetTransactionsInput, logger: ExecutionLogger): Promise<FinancialInstitutionTransaction[]> {
    const transactionsEndpoint = getEnvironmentVariable(MOCK_TRANSACTIONS_ENDPOINT_ENV_VARIABLE_KEY);
    const result = await apiRequest<FinancialInstitutionTransaction[]>({
      method: 'GET',
      url: `${this._projectSecret}.${HOST_BY_INSTITUTION_ID[this._config.financialInstitutionId]}/${transactionsEndpoint}?sortBy=createdAt&order=desc`,
    }, logger);
    if (result.error) {
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