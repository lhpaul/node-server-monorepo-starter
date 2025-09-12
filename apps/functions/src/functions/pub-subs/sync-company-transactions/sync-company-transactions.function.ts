import { SECRETS } from '@repo/shared/constants';
import { SyncCompanyTransactionsMessage } from '@repo/shared/domain';

import { onMessagePublishedWrapper } from '../../../utils/pub-subs/pub-subs.utils';
import { MAX_INSTANCES, SYNC_COMPANY_TRANSACTIONS_TOPIC } from './sync-company-transactions.function.constants';
import { syncCompanyTransactionsHandler } from './sync-company-transactions.function.handler';

export const syncCompanyTransactionsFunction = onMessagePublishedWrapper<SyncCompanyTransactionsMessage>(
  SyncCompanyTransactionsMessage,
  syncCompanyTransactionsHandler,
  {
    topic: SYNC_COMPANY_TRANSACTIONS_TOPIC,
    maxInstances: MAX_INSTANCES,
    secrets: [SECRETS.MOCK_API_PROJECT_SECRET]
  }
);