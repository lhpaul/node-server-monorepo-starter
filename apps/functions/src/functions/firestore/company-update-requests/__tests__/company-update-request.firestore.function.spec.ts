import { CompanyUpdateRequestsRepository } from '../../../../repositories/company-update-requests';
import { collectionOnWriteFunctionWrapper } from '../../../../utils/firestore/firestore.utils';
import { companyUpdateRequestOnCreateHandler } from '../handlers/on-create/company-update-request.on-create.handler';
import { MAX_RETRIES } from '../company-update-request.firestore.constants';

jest.mock('../../../../utils/firestore/firestore.utils');

describe('companyUpdateRequestOnWriteFunction', () => {
  let fn: any;
  let mockWrapper: jest.Mocked<typeof collectionOnWriteFunctionWrapper>;

  beforeEach(() => {
    jest.clearAllMocks();
    fn = jest.requireActual('../company-update-request.firestore.function');
    mockWrapper = jest.mocked(collectionOnWriteFunctionWrapper);
  });

  it('should call wrapper with correct arguments', () => {
    expect(fn).toBeDefined();
    expect(mockWrapper).toHaveBeenCalledWith({
      path: CompanyUpdateRequestsRepository.COLLECTION_PATH,
      handlers: {
        onCreate: {
          function: companyUpdateRequestOnCreateHandler,
          options: {
            maxRetries: MAX_RETRIES,
          },
        },
      },
    });
  });
}); 