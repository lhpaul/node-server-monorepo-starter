import { onScheduleWrapper } from '../../../utils/schedulers/schedulers.utils';
import { HANDLER_NAME, SCHEDULE } from './sync-companies-transactions.function.constants';
import { syncCompaniesTransactionsHandler } from './sync-companies-transactions.function.handler';

export const syncCompaniesTransactionsFunction = onScheduleWrapper(
  HANDLER_NAME,
  SCHEDULE,
  syncCompaniesTransactionsHandler
);