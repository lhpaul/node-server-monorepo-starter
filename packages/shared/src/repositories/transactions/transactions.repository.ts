import { ExecutionLogger } from '../../definitions';
import { FirestoreCollectionRepository, RepositoryError, RepositoryErrorCode } from '../../utils/repositories';
import { CompaniesRepository } from '../companies/companies.repository';
import { COLLECTION_PATH, ERROR_MESSAGES } from './transactions.repository.constants';
import {
  TransactionDocument,
  CreateTransactionDocumentInput,
  UpdateTransactionDocumentInput,
  QueryTransactionsInput,
} from './transactions.repository.interfaces';

export class TransactionsRepository extends FirestoreCollectionRepository<TransactionDocument, CreateTransactionDocumentInput, UpdateTransactionDocumentInput, QueryTransactionsInput> {
  static readonly COLLECTION_PATH = COLLECTION_PATH;
  private static instance: TransactionsRepository;
  public static getInstance(): TransactionsRepository {
    if (!TransactionsRepository.instance) {
      TransactionsRepository.instance = new TransactionsRepository();
    }
    return TransactionsRepository.instance;
  }
  constructor() {
    super({
      collectionPath: COLLECTION_PATH
    });
  }

  /**
   * Creates a new transaction
   * @param data - The data to create the new transaction with
   * @param logger - Logger instance for tracking execution
   * @returns Promise resolving to the ID of the created transaction
   * @throws RepositoryError with code {@link RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND} if the related company is not found
   */
  async createDocument(data: CreateTransactionDocumentInput, logger: ExecutionLogger): Promise<string> {
    const { companyId } = data;
    const company = await CompaniesRepository.getInstance().getDocument(companyId, logger);
    if (!company) {
      throw new RepositoryError({
        code: RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND,
        message: ERROR_MESSAGES.COMPANY_NOT_FOUND,
        data: {
          companyId,
        },
      });
    }
    return super.createDocument(data, logger);
  }
}
