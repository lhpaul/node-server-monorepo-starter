import { Transaction } from '@repo/shared/domain';
import { TransactionsService } from '@repo/shared/services';
import { printError } from '@repo/shared/utils';

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
  try {
    logger.startStep(STEPS.GET_TRANSACTION.id);
    const transactionsSvc = TransactionsService.getInstance();
    const transaction = await transactionsSvc.getResource(transactionUpdateRequest.transactionId, logger)
    .finally(() => logger.endStep(STEPS.GET_TRANSACTION.id));
    if (!transaction) {
      logger.startStep(STEPS.UPDATE_TRANSACTION_NOT_FOUND_FAILED_STATUS.id);
      await transactionUpdateRequestsRepo.updateDocument(transactionUpdateRequest.id, {
        status: ProcessStatus.FAILED,
        error: ERRORS.TRANSACTION_NOT_FOUND,
      }, logger)
      .finally(() => logger.endStep(STEPS.UPDATE_TRANSACTION_NOT_FOUND_FAILED_STATUS.id));
      return;
    }
    logger.startStep(STEPS.UPDATE_TRANSACTION.id);
    const updateData: Partial<Transaction> = {
      ...(transactionUpdateRequest.amount && { amount: transactionUpdateRequest.amount }),
      ...(transactionUpdateRequest.date && { date: transactionUpdateRequest.date }),
      ...(transactionUpdateRequest.type && { type: transactionUpdateRequest.type }),
    };
    await transactionsSvc.updateResource(transactionUpdateRequest.transactionId, updateData, logger)
    .finally(() => logger.endStep(STEPS.UPDATE_TRANSACTION.id));
    logger.startStep(STEPS.UPDATE_DONE_STATUS.id);
    await transactionUpdateRequestsRepo.updateDocument(transactionUpdateRequest.id, {
      status: ProcessStatus.DONE,
    }, logger)
    .finally(() => logger.endStep(STEPS.UPDATE_DONE_STATUS.id));
  } catch (error) {
    logger.startStep(STEPS.UPDATE_UNKNOWN_ERROR_FAILED_STATUS.id);
    await transactionUpdateRequestsRepo.updateDocument(transactionUpdateRequest.id, {
      status: ProcessStatus.FAILED,
      error: printError(error),
    }, logger)
    .finally(() => logger.endStep(STEPS.UPDATE_UNKNOWN_ERROR_FAILED_STATUS.id));
    throw error;
  }
}