import { TransactionsService } from '@repo/shared/services';
import { DomainModelServiceError, DomainModelServiceErrorCode, printError } from '@repo/shared/utils';

import { ProcessStatus } from '../../../../../definitions';
import { TransactionCreateRequestDocument, TransactionCreateRequestsRepository } from '../../../../../repositories/transaction-create-requests';
import { CollectionEventContext } from '../../../../../utils/firestore/firestore.utils.interfaces';
import { FunctionLogger } from '../../../../../utils/logging/function-logger.class';
import { STEPS } from './transaction-create-request.on-create.constants';

export async function transactionCreateRequestOnCreateHandler<DocumentModel extends TransactionCreateRequestDocument>({
  context,
  documentData: transactionCreateRequest,
  logger
}: {
  context: CollectionEventContext;
  documentData: DocumentModel;
  logger: FunctionLogger;
}): Promise<void> {
  const transactionCreateRequestsRepo = TransactionCreateRequestsRepository.getInstance();
  const logGroup = transactionCreateRequestOnCreateHandler.name;
  try {
    logger.startStep(STEPS.CREATE_TRANSACTION.id, logGroup);
    const createData = {
      amount: transactionCreateRequest.amount,
      companyId: context.params.companyId,
      date: transactionCreateRequest.date,
      type: transactionCreateRequest.type,
    };
    const transactionId = await TransactionsService.getInstance().createResource(createData, logger)
    .finally(() => logger.endStep(STEPS.CREATE_TRANSACTION.id));
    logger.startStep(STEPS.UPDATE_DONE_STATUS.id, logGroup);
    await transactionCreateRequestsRepo.updateDocument(transactionCreateRequest.id, {
      status: ProcessStatus.DONE,
      transactionId,
    }, logger)
    .finally(() => logger.endStep(STEPS.UPDATE_DONE_STATUS.id));
  } catch (error) {
    if (error instanceof DomainModelServiceError && error.code === DomainModelServiceErrorCode.INVALID_INPUT) {
      logger.startStep(STEPS.UPDATE_INVALID_CREATE_FAILED_STATUS.id, logGroup);
      await transactionCreateRequestsRepo.updateDocument(transactionCreateRequest.id, {
        status: ProcessStatus.FAILED,
        error: {
          code: error.code,
          message: error.message
        },
      }, logger)
      .finally(() => logger.endStep(STEPS.UPDATE_INVALID_CREATE_FAILED_STATUS.id));
      return;
    }
    logger.startStep(STEPS.UPDATE_UNKNOWN_ERROR_FAILED_STATUS.id, logGroup);
    await transactionCreateRequestsRepo.updateDocument(transactionCreateRequest.id, {
      status: ProcessStatus.FAILED,
      error: printError(error),
    }, logger)
    .finally(() => logger.endStep(STEPS.UPDATE_UNKNOWN_ERROR_FAILED_STATUS.id));
    throw error;
  }
} 