import { TransactionCreateRequestsRepository } from '../../../../repositories/transaction-create-requests';
import { collectionOnWriteFunctionWrapper } from '../../../../utils/firestore/firestore.utils';
import { transactionCreateRequestOnCreateHandler } from '../handlers/on-create/transaction-create-request.on-create.handler';
import { MAX_RETRIES } from '../transaction-create-request.firestore.constants';

jest.mock('../../../../utils/firestore/firestore.utils');

describe('transactionCreateRequestOnWriteFunction', () => {
  let fn: any;
  let mockWrapper: jest.Mocked<typeof collectionOnWriteFunctionWrapper>;

  beforeEach(() => {
    jest.clearAllMocks();
    fn = jest.requireActual('../transaction-create-request.firestore.function');
    mockWrapper = jest.mocked(collectionOnWriteFunctionWrapper);
  });

  it('should call wrapper with correct arguments', () => {
    expect(fn).toBeDefined();
    expect(mockWrapper).toHaveBeenCalledWith({
      path: TransactionCreateRequestsRepository.COLLECTION_PATH,
      handlers: {
        onCreate: {
          function: transactionCreateRequestOnCreateHandler,
          options: {
            maxRetries: MAX_RETRIES,
          },
        },
      },
    });
  });
}); 