import { TransactionUpdateRequestDocument } from '@repo/shared/repositories';

import { CollectionEventContext } from '../../../../../utils/firestore/firestore.utils.interfaces';
import { FunctionLogger } from '../../../../../utils/logging/function-logger.class';

export async function transactionUpdateRequestOnCreateHandler<DocumentModel extends TransactionUpdateRequestDocument>({
  context,
  documentData,
  logger
}: {
  context: CollectionEventContext;
  documentData: DocumentModel;
  logger: FunctionLogger;
}): Promise<void> {
  logger.info({
    context,
    documentData
  }, 'Transaction update request created');
  // TODO: Notify approvers
}