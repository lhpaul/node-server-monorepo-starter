import { ExecutionLogger } from '../../definitions';
import { Transaction } from '../../domain';
import { InMemoryRepository } from '../../utils/repositories/in-memory-repository.class';
import { RepositoryError, RepositoryErrorCode } from '../../utils/repositories/repositories.errors';
import { CompaniesRepository } from '../companies/companies.repository';
import { ERROR_MESSAGES, MOCK_TRANSACTIONS } from './transactions.repository.constants';
import {
  CreateTransactionInput,
  GetTransactionsQuery,
  UpdateTransactionInput,
} from './transactions.repository.interfaces';


export class TransactionsRepository extends InMemoryRepository<Transaction, CreateTransactionInput, UpdateTransactionInput, GetTransactionsQuery> {
  private static instance: TransactionsRepository;

  public static getInstance(): TransactionsRepository {
    if (!TransactionsRepository.instance) {
      TransactionsRepository.instance = new TransactionsRepository(MOCK_TRANSACTIONS);
    }
    return TransactionsRepository.instance;
  }

  /**
   * Creates a new transaction
   * @param data - The data to create the new transaction with
   * @param logger - Logger instance for tracking execution
   * @returns Promise resolving to the ID of the created transaction
   * @throws RepositoryError with code {@link RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND} if the related company is not found
   */
  async createDocument(data: CreateTransactionInput, logger: ExecutionLogger): Promise<string> {
    const { companyId } = data;
    const company = await CompaniesRepository.getInstance().getDocument(companyId, logger);
    if (!company) {
      throw(new RepositoryError({
        code: RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND,
        message: ERROR_MESSAGES.COMPANY_NOT_FOUND,
        data: {
          companyId,
        },
      }))
    }
    return super.createDocument(data, logger);
  }
}
