import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { TransactionsService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../../definitions/auth.interfaces';
import { 
  hasCompanyFinancialInstitutionsCreatePermission, 
  hasCompanyFinancialInstitutionsReadPermission 
} from '../../../../../../utils/auth/auth.utils';
import { STEPS } from './sync-transactions.handler.constants';
import { SyncTransactionsBody, SyncTransactionsParams } from './sync-transactions.handler.interfaces';

export const syncTransactionsHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: syncTransactionsHandler.name });
  const logGroup = syncTransactionsHandler.name;
  const { companyId, financialInstitutionId } = request.params as SyncTransactionsParams;
  const { fromDate, toDate } = request.body as SyncTransactionsBody;
  const user = request.user as AuthUser;
  
  // Check if user has permission to either create or read financial institutions for this company
  if (!hasCompanyFinancialInstitutionsCreatePermission(companyId, user) && 
      !hasCompanyFinancialInstitutionsReadPermission(companyId, user)) {
    return reply.code(STATUS_CODES.FORBIDDEN).send({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
  }
  
  logger.startStep(STEPS.SYNC_TRANSACTIONS.id, logGroup);
  const service = TransactionsService.getInstance();
  await service.syncWithFinancialInstitution({
    companyId,
    financialInstitutionId,
    fromDate,
    toDate,
  }, logger).finally(() => {
    logger.endStep(STEPS.SYNC_TRANSACTIONS.id);
  });
  return reply.code(STATUS_CODES.NO_CONTENT).send();
}; 