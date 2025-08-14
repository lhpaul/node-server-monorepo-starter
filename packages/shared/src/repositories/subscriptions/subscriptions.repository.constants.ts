import { SubscriptionDocument } from "./subscriptions.repository.interfaces";

export const ERROR_MESSAGES = {
  COMPANY_NOT_FOUND: 'Company not found',
};

const now = new Date();
export const MOCK_SUBSCRIPTIONS: SubscriptionDocument[] = [
  {
    id: '0',
    companyId: '0',
    startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
    endsAt: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()),
    createdAt: now,
    updatedAt: now,
  },
]; 