// External dependencies (alphabetical, @ first)
import moment from 'moment';

// Internal modules (farthest path first, then alphabetical)
import { ExecutionLogger } from '../../../definitions';
import { Subscription } from '../../../domain/entities';
import {
  SubscriptionsRepository,
  SubscriptionDocument,
  CreateSubscriptionDocumentInput,
  GetSubscriptionsQuery,
  UpdateSubscriptionDocumentInput,
} from '../../../repositories';
import { DomainModelService } from '../../../utils/services';

// Local imports (alphabetical)
import {
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  FilterSubscriptionsInput,
} from './subscriptions.service.interfaces';

export class SubscriptionsService extends DomainModelService<Subscription, SubscriptionDocument, CreateSubscriptionInput, CreateSubscriptionDocumentInput, UpdateSubscriptionInput, UpdateSubscriptionDocumentInput, FilterSubscriptionsInput, GetSubscriptionsQuery> {
  private static instance: SubscriptionsService;

  public static getInstance(): SubscriptionsService {
    if (!this.instance) {
      this.instance = new SubscriptionsService(SubscriptionsRepository.getInstance(), Subscription);
    }
    return this.instance;
  }

  public async getAboutToExpireSubscriptions(daysToExpire: number, logger: ExecutionLogger): Promise<Subscription[]> {
    const now = moment();
    const from = now.add(daysToExpire, 'days').startOf('day').toDate();
    const to = now.add(daysToExpire, 'days').endOf('day').toDate();
    return this.repository.getDocumentsList({
      endsAt: [{ operator: '>=', value: from }, { operator: '<=', value: to }],
    }, logger);
  }

  public async getActiveSubscriptions(logger: ExecutionLogger): Promise<Subscription[]> {
    return this.repository.getDocumentsList({
      endsAt: [{ operator: '>=', value: new Date() }],
    }, logger);
  }
} 