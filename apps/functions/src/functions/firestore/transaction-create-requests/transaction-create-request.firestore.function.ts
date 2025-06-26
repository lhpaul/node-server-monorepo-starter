import { TransactionCreateRequestDocument, TransactionCreateRequestsRepository } from '../../../repositories/transaction-create-requests';
import { collectionOnWriteFunctionWrapper } from '../../../utils/firestore/firestore.utils';
import { MAX_RETRIES } from './transaction-create-request.firestore.constants';
import { transactionCreateRequestOnCreateHandler } from './handlers/on-create/transaction-create-request.on-create.handler';

export const transactionCreateRequestOnWriteFunction = collectionOnWriteFunctionWrapper<TransactionCreateRequestDocument>({
  path: TransactionCreateRequestsRepository.COLLECTION_PATH,
  handlers: {
    onCreate: {
      function: transactionCreateRequestOnCreateHandler,
      options: {
        maxRetries: MAX_RETRIES,
      }
    }
  }
}); 