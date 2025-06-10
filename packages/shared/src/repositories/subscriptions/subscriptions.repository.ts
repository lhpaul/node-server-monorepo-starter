import { ExecutionLogger } from '../../definitions';
import { InMemoryRepository } from '../../utils/repositories/in-memory-repository.class';
import { RepositoryError, RepositoryErrorCode } from '../../utils/repositories/repositories.errors';
import { CompaniesRepository } from '../companies/companies.repository';
import { ERROR_MESSAGES, MOCK_SUBSCRIPTIONS } from './subscriptions.repository.constants';
import {
  SubscriptionDocument,
  CreateSubscriptionDocumentInput,
  GetSubscriptionsQuery,
  UpdateSubscriptionDocumentInput,
} from './subscriptions.repository.interfaces';

export class SubscriptionsRepository extends InMemoryRepository<SubscriptionDocument, CreateSubscriptionDocumentInput, UpdateSubscriptionDocumentInput, GetSubscriptionsQuery> {
  private static instance: SubscriptionsRepository;

  public static getInstance(): SubscriptionsRepository {
    if (!SubscriptionsRepository.instance) {
      SubscriptionsRepository.instance = new SubscriptionsRepository(MOCK_SUBSCRIPTIONS);
    }
    return SubscriptionsRepository.instance;
  }

  /**
   * Creates a new subscription
   * @param data - The data to create the new subscription with
   * @param logger - Logger instance for tracking execution
   * @returns Promise resolving to the ID of the created subscription
   * @throws RepositoryError with code {@link RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND} if the related company is not found
   */
  async createDocument(data: CreateSubscriptionDocumentInput, logger: ExecutionLogger): Promise<string> {
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