import { SECRETS } from '@repo/shared/constants';
import { SyncCompanyTransactionsMessage } from '@repo/shared/domain';

import { onMessagePublishedWrapper } from '../../../../utils/pub-subs/pub-subs.utils';
import { syncCompanyTransactionsHandler } from '../sync-company-transactions.function.handler';
import { MAX_INSTANCES, SYNC_COMPANY_TRANSACTIONS_TOPIC } from '../sync-company-transactions.function.constants';

jest.mock('../../../../utils/pub-subs/pub-subs.utils');

describe('syncCompanyTransactionsFunction', () => {
  let fn: any;
  let mockWrapper: jest.Mocked<typeof onMessagePublishedWrapper>;

  beforeEach(() => {
    jest.clearAllMocks();
    fn = jest.requireActual('../sync-company-transactions.function');
    mockWrapper = jest.mocked(onMessagePublishedWrapper);
  });

  it('should call the wrapper correctly', async () => {
    expect(fn).toBeDefined();
    expect(mockWrapper).toHaveBeenCalledWith(
      SyncCompanyTransactionsMessage,
      syncCompanyTransactionsHandler,
      {
        topic: SYNC_COMPANY_TRANSACTIONS_TOPIC,
        maxInstances: MAX_INSTANCES,
        secrets: [SECRETS.MOCK_API_PROJECT_SECRET]
      }
    );
  });
});
