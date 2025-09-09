import { onScheduleWrapper } from '../../../../utils/schedulers/schedulers.utils';
import { HANDLER_NAME, SCHEDULE } from '../sync-companies-transactions.function.constants';
import { syncCompaniesTransactionsHandler } from '../sync-companies-transactions.function.handler';

jest.mock('../../../../utils/schedulers/schedulers.utils');

describe('syncCompaniesTransactionsFunction', () => {
  let fn: any;
  let mockWrapper: jest.Mocked<typeof onScheduleWrapper>;

  beforeEach(() => {
    jest.clearAllMocks();
    fn = jest.requireActual('../sync-companies-transactions.function');
    mockWrapper = jest.mocked(onScheduleWrapper);
  });

  it('should call the wrapper correctly', async () => {
    expect(fn).toBeDefined();
    expect(mockWrapper).toHaveBeenCalledWith(HANDLER_NAME, SCHEDULE, syncCompaniesTransactionsHandler);
  });
});
