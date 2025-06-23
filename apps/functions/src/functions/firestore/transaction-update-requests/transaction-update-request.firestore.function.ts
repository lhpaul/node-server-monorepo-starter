import { TransactionUpdateRequestDocument, TransactionUpdateRequestsRepository } from '@repo/shared/repositories';

import { collectionOnWriteFunction } from '../../../utils/firestore/firestore.utils';
import { transactionUpdateRequestOnCreateHandler } from './handlers/on-create/transaction-update-request.on-create.handler';


export const transactionUpdateRequestOnWriteFunction = collectionOnWriteFunction<TransactionUpdateRequestDocument>({
  path: TransactionUpdateRequestsRepository.COLLECTION_PATH,
  handlers: {
    onCreate: {
      function: transactionUpdateRequestOnCreateHandler,
    }
  }
});