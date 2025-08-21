import moment from 'moment';

import { ExecutionLogger } from '../../../../definitions';
import { SubscriptionsRepository } from '../../../../repositories';
import { SubscriptionsService } from '../subscriptions.service';

jest.mock('../../../../repositories');


describe(SubscriptionsService.name, () => {
  let service: SubscriptionsService;
  const mockSubscriptionsRepository = {
    getDocumentsList: jest.fn(),
  } as unknown as SubscriptionsRepository;
  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    fatal: jest.fn(),
    silent: jest.fn(),
  } as unknown as ExecutionLogger;

  beforeEach(() => {
    jest.clearAllMocks();
    (SubscriptionsRepository.getInstance as jest.Mock).mockReturnValue(mockSubscriptionsRepository);
    (SubscriptionsService as any).instance = undefined;
  });

  describe(SubscriptionsService.getInstance.name, () => {
    it('should create a new instance if one does not exist', () => {
      const service = SubscriptionsService.getInstance();
      
      expect(service).toBeInstanceOf(SubscriptionsService);
      expect(SubscriptionsRepository.getInstance).toHaveBeenCalledTimes(1);
    });

    it('should return the same instance on subsequent calls', () => {
      const firstInstance = SubscriptionsService.getInstance();
      const secondInstance = SubscriptionsService.getInstance();
      
      expect(firstInstance).toBe(secondInstance);
      expect(SubscriptionsRepository.getInstance).toHaveBeenCalledTimes(1);
    });
  });

  describe(SubscriptionsService.prototype.getAboutToExpireSubscriptions.name, () => {
    beforeEach(() => {
      service = SubscriptionsService.getInstance();
    });
    it('should return the subscriptions that are about to expire', async () => {
      const subscriptionsMocks = [
        {
          endsAt: new Date(),
        },
        {
          endsAt: new Date(),
        },
      ];
      (mockSubscriptionsRepository.getDocumentsList as jest.Mock).mockResolvedValueOnce(subscriptionsMocks);
      const subscriptions = await service.getAboutToExpireSubscriptions(1, mockLogger);
      const now = moment();
      const from = now.add(1, 'days').startOf('day').toDate();
      const to = now.add(1, 'days').endOf('day').toDate();
      expect(mockSubscriptionsRepository.getDocumentsList).toHaveBeenCalledWith({
        endsAt: [{ operator: '>=', value: from }, { operator: '<=', value: to }],
      }, mockLogger);
      expect(subscriptions).toEqual(subscriptionsMocks);
    });
  });
}); 