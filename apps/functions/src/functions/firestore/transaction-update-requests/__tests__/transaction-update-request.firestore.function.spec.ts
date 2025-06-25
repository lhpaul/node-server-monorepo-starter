import { TransactionUpdateRequestsRepository } from '../../../../repositories/transaction-update-requests';
import { collectionOnWriteFunctionWrapper } from '../../../../utils/firestore/firestore.utils';
import { transactionUpdateRequestOnCreateHandler } from '../handlers/on-create/transaction-update-request.on-create.handler';
import { MAX_RETRIES } from '../transaction-update-request.firestore.constants';

jest.mock('../../../../utils/firestore/firestore.utils');

describe('transactionUpdateRequestOnWriteFunction', () => {
  let fn: any;
  let mockWrapper: jest.Mocked<typeof collectionOnWriteFunctionWrapper>;

  beforeEach(() => {
    jest.clearAllMocks();
    fn = jest.requireActual('../transaction-update-request.firestore.function');
    mockWrapper = jest.mocked(collectionOnWriteFunctionWrapper);
  });

  it('should call wrapper with correct arguments', () => {
    expect(fn).toBeDefined();
    expect(mockWrapper).toHaveBeenCalledWith({
      path: TransactionUpdateRequestsRepository.COLLECTION_PATH,
      handlers: {
        onCreate: {
          function: transactionUpdateRequestOnCreateHandler,
          options: {
            maxRetries: MAX_RETRIES,
          },
        },
      },
    });
  });
}); 