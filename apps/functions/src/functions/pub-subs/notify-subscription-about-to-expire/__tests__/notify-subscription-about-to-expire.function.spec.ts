import { NotifySubscriptionAboutToExpireMessage } from '@repo/shared/domain';

import { onMessagePublishedWrapper } from '../../../../utils/pub-subs/pub-subs.utils';
import { notifySubscriptionAboutToExpireHandler } from '../notify-subscription-about-to-expire.function.handler';
import { NOTIFY_SUBSCRIPTION_ABOUT_TO_EXPIRE_TOPIC } from '../notify-subscription-about-to-expire.function.constants';

jest.mock('../../../../utils/pub-subs/pub-subs.utils');

describe('notifySubscriptionAboutToExpireFunction', () => {
  let fn: any;
  let mockWrapper: jest.Mocked<typeof onMessagePublishedWrapper>;

  beforeEach(() => {
    fn = jest.requireActual('../notify-subscription-about-to-expire.function');
    mockWrapper = jest.mocked(onMessagePublishedWrapper);
  });

  it('should call the wrapper correctly', async () => {
    expect(fn).toBeDefined();
    expect(mockWrapper).toHaveBeenCalledWith(
      NotifySubscriptionAboutToExpireMessage,
      NOTIFY_SUBSCRIPTION_ABOUT_TO_EXPIRE_TOPIC,
      notifySubscriptionAboutToExpireHandler
    );
  });
}); 