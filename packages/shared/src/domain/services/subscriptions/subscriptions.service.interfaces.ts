import { DocumentModel, FilterInput, FilterItem } from '../../../definitions';

export interface SubscriptionDocument extends DocumentModel {
  companyId: string;
  startsAt: Date;
  endsAt: Date;
}

export interface CreateSubscriptionInput {
  companyId: string;
  startsAt: Date;
  endsAt: Date;
}

export interface UpdateSubscriptionInput {
  companyId?: string;
  startsAt?: Date;
  endsAt?: Date;
}

export interface FilterSubscriptionsInput extends FilterInput {
  companyId?: FilterItem<string>[];
  startsAt?: FilterItem<Date>[];
  endsAt?: FilterItem<Date>[];
} 