import { DocumentModel, QueryInput, QueryItem } from '../../definitions/repositories.interfaces';

export interface SubscriptionDocument extends DocumentModel {
  companyId: string;
  startsAt: Date;
  endsAt: Date;
}

export interface CreateSubscriptionDocumentInput {
  companyId: string;
  startsAt: Date;
  endsAt: Date;
}

export interface UpdateSubscriptionDocumentInput {
  endsAt?: Date;
  startsAt?: Date;
}

export interface QuerySubscriptionsInput extends QueryInput {
  companyId?: QueryItem<string>[];
  startsAt?: QueryItem<Date>[];
  endsAt?: QueryItem<Date>[];
} 