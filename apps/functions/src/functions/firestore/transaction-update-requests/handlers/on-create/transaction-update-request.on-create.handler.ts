import { Transaction } from '@repo/shared/domain';
import { TransactionsService } from '@repo/shared/services';
import { DomainModelServiceError, DomainModelServiceErrorCode, printError } from '@repo/shared/utils';

import { ProcessStatus } from '../../../../../definitions';
import { TransactionUpdateRequestDocument, TransactionUpdateRequestsRepository } from '../../../../../repositories/transaction-update-requests';
import { CollectionEventContext } from '../../../../../utils/firestore/firestore.utils.interfaces';
import { FunctionLogger } from '../../../../../utils/logging/function-logger.class';
import { ERRORS,STEPS } from './transaction-update-request.on-create.constants';

export async function transactionUpdateRequestOnCreateHandler<DocumentModel extends TransactionUpdateRequestDocument>({
  context,
  documentData: transactionUpdateRequest,
  logger
}: {
  context: CollectionEventContext;
  documentData: DocumentModel;
  logger: FunctionLogger;
}): Promise<void> {
  const transactionUpdateRequestsRepo = TransactionUpdateRequestsRepository.getInstance();
  const logGroup = transactionUpdateRequestOnCreateHandler.name;
  try {
    logger.startStep(STEPS.UPDATE_TRANSACTION.id, logGroup);
    const updateData: Partial<Transaction> = {
      ...(transactionUpdateRequest.amount && { amount: transactionUpdateRequest.amount }),
      ...(transactionUpdateRequest.date && { date: transactionUpdateRequest.date }),
      ...(transactionUpdateRequest.type && { type: transactionUpdateRequest.type }),
    };
    await TransactionsService.getInstance().updateResource(transactionUpdateRequest.transactionId, updateData, logger)
    .finally(() => logger.endStep(STEPS.UPDATE_TRANSACTION.id));
    logger.startStep(STEPS.UPDATE_DONE_STATUS.id, logGroup);
    await transactionUpdateRequestsRepo.updateDocument(transactionUpdateRequest.id, {
      status: ProcessStatus.DONE,
    }, logger)
    .finally(() => logger.endStep(STEPS.UPDATE_DONE_STATUS.id));
  } catch (error) {
    
    if (error instanceof DomainModelServiceError) {
      let errorData: { code: string, message: string } | null = null;
      if (error.code === DomainModelServiceErrorCode.INVALID_INPUT) {
        errorData = {
          code: error.code,
          message: error.message
        };
      }
      if (error.code === DomainModelServiceErrorCode.RESOURCE_NOT_FOUND) {
        errorData = ERRORS.TRANSACTION_NOT_FOUND;
      }
      if (errorData) {
        logger.startStep(STEPS.UPDATE_INVALID_UPDATE_FAILED_STATUS.id, logGroup);
        await transactionUpdateRequestsRepo.updateDocument(transactionUpdateRequest.id, {
          status: ProcessStatus.FAILED,
          error: errorData,
        }, logger)
        .finally(() => logger.endStep(STEPS.UPDATE_INVALID_UPDATE_FAILED_STATUS.id));
        return;
      }
    }
    logger.startStep(STEPS.UPDATE_UNKNOWN_ERROR_FAILED_STATUS.id, logGroup);
    await transactionUpdateRequestsRepo.updateDocument(transactionUpdateRequest.id, {
      status: ProcessStatus.FAILED,
      error: printError(error),
    }, logger)
    .finally(() => logger.endStep(STEPS.UPDATE_UNKNOWN_ERROR_FAILED_STATUS.id));
    throw error;
  }
}