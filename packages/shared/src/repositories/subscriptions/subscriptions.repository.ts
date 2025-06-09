import { Subscription } from '../../domain/models/subscription.model';
import { FirestoreCollectionRepository } from '../../utils/firestore/firestore-collection-repository.class';
import { COLLECTION_PATH } from './subscriptions.repository.constants';
import { CreateSubscriptionInput, GetSubscriptionsQuery, UpdateSubscriptionInput } from './subscriptions.repository.interfaces';

export class SubscriptionsRepository extends FirestoreCollectionRepository<Subscription, CreateSubscriptionInput, UpdateSubscriptionInput, GetSubscriptionsQuery> {
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
