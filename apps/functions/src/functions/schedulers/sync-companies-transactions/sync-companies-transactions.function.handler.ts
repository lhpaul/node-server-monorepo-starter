import { SubscriptionsService, SyncCompanyTransactionsMessage } from '@repo/shared/domain';
import { publishMessage } from '@repo/shared/utils';
import moment from 'moment';

import { FunctionLogger } from '../../../utils/logging/function-logger.class';
import { SYNC_COMPANY_TRANSACTIONS_TOPIC } from '../../pub-subs/sync-company-transactions/sync-company-transactions.function.constants';
import { STEPS } from './sync-companies-transactions.function.constants';

export async function syncCompaniesTransactionsHandler(logger: FunctionLogger) {
  const logGroup = syncCompaniesTransactionsHandler.name;
  logger.startStep(STEPS.GET_ACTIVE_SUBSCRIPTIONS, logGroup);
  const activeSubscriptions = await SubscriptionsService.getInstance().getActiveSubscriptions(logger)
  .finally(() => logger.endStep(STEPS.GET_ACTIVE_SUBSCRIPTIONS));
  logger.startStep(STEPS.PUBLISH_SYNC_COMPANIES_TRANSACTIONS_MESSAGES, logGroup);
  const now = moment();
  const fromDate = now.subtract(1, 'week').format('YYYY-MM-DD');
  const toDate = now.format('YYYY-MM-DD');
  for (const subscription of activeSubscriptions) {
    const logId = `${STEPS.PUBLISH_SYNC_COMPANIES_TRANSACTIONS_MESSAGES}-${subscription.id}`;
    logger.startStep(logId, logGroup);
    await publishMessage<SyncCompanyTransactionsMessage>(SyncCompanyTransactionsMessage, SYNC_COMPANY_TRANSACTIONS_TOPIC, {
      companyId: subscription.companyId,
      fromDate,
      toDate,
    }, logger)
    .finally(() => logger.endStep(logId));
  }
  logger.endStep(STEPS.PUBLISH_SYNC_COMPANIES_TRANSACTIONS_MESSAGES);
}