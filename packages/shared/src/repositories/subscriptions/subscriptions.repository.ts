import { FirestoreCollectionRepository } from '../../utils/repositories';
import { COLLECTION_PATH } from './subscriptions.repository.constants';
import { SubscriptionDocument, CreateSubscriptionDocumentInput, UpdateSubscriptionDocumentInput, QuerySubscriptionsInput } from './subscriptions.repository.interfaces';

export class SubscriptionsRepository extends FirestoreCollectionRepository<SubscriptionDocument, CreateSubscriptionDocumentInput, UpdateSubscriptionDocumentInput, QuerySubscriptionsInput> {
  private static instance: SubscriptionsRepository;
  public static getInstance(): SubscriptionsRepository {
    if (!SubscriptionsRepository.instance) {
      SubscriptionsRepository.instance = new SubscriptionsRepository();
    }
    return SubscriptionsRepository.instance;
  }
  constructor() {
    super({
      collectionPath: COLLECTION_PATH
    });
  }
}
