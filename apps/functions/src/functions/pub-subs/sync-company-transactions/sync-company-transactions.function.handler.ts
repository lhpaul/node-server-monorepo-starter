import { CompaniesService, SyncCompanyTransactionsMessage, TransactionsService } from '@repo/shared/domain';

import { FunctionLogger } from '../../../utils/logging/function-logger.class';
import { STEPS } from './sync-company-transactions.function.constants';

export async function syncCompanyTransactionsHandler(
  message: SyncCompanyTransactionsMessage,
  logger: FunctionLogger,
) {
  const logGroup = syncCompanyTransactionsHandler.name;
  const { companyId, fromDate, toDate } = message;
  logger.startStep(STEPS.GET_COMPANIES_FINANCIAL_INSTITUTIONS, logGroup);
  const financialInstitutions = await CompaniesService.getInstance().listFinancialInstitutions(companyId, logger)
  .finally(() => logger.endStep(STEPS.GET_COMPANIES_FINANCIAL_INSTITUTIONS));
  logger.startStep(STEPS.SYNC_FINANCIAL_INSTITUTION_TRANSACTIONS, logGroup);

  await Promise.all(financialInstitutions.map(async (financialInstitution) => {
    const logId = `${STEPS.SYNC_FINANCIAL_INSTITUTION_TRANSACTIONS}-${financialInstitution.financialInstitution.id}`;
    logger.startStep(logId, logGroup);
    await TransactionsService.getInstance().syncWithFinancialInstitution({
      companyId,
      financialInstitutionId: financialInstitution.financialInstitution.id,
      fromDate,
      toDate,
    }, logger).finally(() => logger.endStep(logId));
  })).finally(() => logger.endStep(STEPS.SYNC_FINANCIAL_INSTITUTION_TRANSACTIONS));
}
