import { TransactionUpdateRequestDocument, TransactionUpdateRequestsRepository } from '../../../repositories/transaction-update-requests';
import { collectionOnWriteFunctionWrapper } from '../../../utils/firestore/firestore.utils';
import { MAX_RETRIES } from './transaction-update-request.firestore.constants';
import { transactionUpdateRequestOnCreateHandler } from './handlers/on-create/transaction-update-request.on-create.handler';

export const transactionUpdateRequestOnWriteFunction = collectionOnWriteFunctionWrapper<TransactionUpdateRequestDocument>({
  path: TransactionUpdateRequestsRepository.COLLECTION_PATH,
  handlers: {
    onCreate: {
      function: transactionUpdateRequestOnCreateHandler,
      options: {
        maxRetries: MAX_RETRIES,
      }
    }
  }
});