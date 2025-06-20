import { Subscription } from '../../domain';
import {
  SubscriptionsRepository,
  SubscriptionDocument,
  CreateSubscriptionDocumentInput,
  GetSubscriptionsQuery,
  UpdateSubscriptionDocumentInput,
} from '../../repositories';
import { DomainModelService } from '../../utils/services';
import {
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  FilterSubscriptionsInput,
} from './subscriptions.service.interfaces';

export class SubscriptionsService extends DomainModelService<Subscription, SubscriptionDocument, CreateSubscriptionInput, CreateSubscriptionDocumentInput, UpdateSubscriptionInput, UpdateSubscriptionDocumentInput, FilterSubscriptionsInput, GetSubscriptionsQuery> {
  private static instance: SubscriptionsService;

  public static getInstance(): SubscriptionsService {
    if (!this.instance) {
      this.instance = new SubscriptionsService(SubscriptionsRepository.getInstance());
    }
    return this.instance;
  }
} 