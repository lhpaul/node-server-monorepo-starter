import moment from 'moment';

import { ExecutionLogger } from '../../../definitions';
import { Subscription } from '../../../domain/entities';
import {
  SubscriptionsRepository,
  SubscriptionDocument,
  CreateSubscriptionDocumentInput,
  QuerySubscriptionsInput,
  UpdateSubscriptionDocumentInput,
} from '../../../repositories';
import { DomainModelService } from '../../../utils/services';

// Local imports (alphabetical)
import {
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  FilterSubscriptionsInput,
} from './subscriptions.service.interfaces';

export class SubscriptionsService extends DomainModelService<Subscription, SubscriptionDocument, CreateSubscriptionInput, CreateSubscriptionDocumentInput, UpdateSubscriptionInput, UpdateSubscriptionDocumentInput, FilterSubscriptionsInput, QuerySubscriptionsInput> {
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
} 