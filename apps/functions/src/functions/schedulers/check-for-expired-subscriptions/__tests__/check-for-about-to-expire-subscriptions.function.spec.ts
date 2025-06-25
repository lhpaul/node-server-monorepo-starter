import { onScheduleWrapper } from '../../../../utils/schedulers/schedulers.utils';
import { checkForAboutToExpireSubscriptionsHandler } from '../check-for-about-to-expire-subscriptions.function.handler';
import { HANDLER_NAME, SCHEDULE } from '../check-for-about-to-expire-subscriptions.function.constants';

jest.mock('../../../../utils/schedulers/schedulers.utils');

describe('checkForAboutToExpireSubscriptionsFunction', () => {
  let fn: any;
  let mockWrapper: jest.Mocked<typeof onScheduleWrapper>;


  beforeEach(() => {
    jest.clearAllMocks();
    fn = jest.requireActual('../check-for-about-to-expire-subscriptions.function');
    mockWrapper = jest.mocked(onScheduleWrapper);
  });
  it('should called the wrapper correctly', async () => {
    expect(fn).toBeDefined();
    expect(mockWrapper).toHaveBeenCalledWith(HANDLER_NAME, SCHEDULE, checkForAboutToExpireSubscriptionsHandler);
  });
});