import { QueryInput, QueryItem } from '../../definitions/listing.interfaces';
export interface CreateSubscriptionInput {
  companyId: string;
  startsAt: Date;
  endsAt: Date;
}

export interface UpdateSubscriptionInput {
  endsAt?: Date;
  startsAt?: Date;
}

export interface GetSubscriptionsQuery extends QueryInput {
  companyId?: QueryItem<string>[];
  startsAt?: QueryItem<Date>[];
  endsAt?: QueryItem<Date>[];
} 