import { SubscriptionsRepository } from '../../../../repositories';
import { SubscriptionsService } from '../subscriptions.service';

jest.mock('../../../repositories');


describe(SubscriptionsService.name, () => {
  let mockSubscriptionsRepository: jest.Mocked<SubscriptionsRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSubscriptionsRepository = {
      // Add mock methods as needed
    } as unknown as jest.Mocked<SubscriptionsRepository>;

    (SubscriptionsRepository.getInstance as jest.Mock).mockReturnValue(mockSubscriptionsRepository);

    (SubscriptionsService as any).instance = undefined;
  });

  describe('getInstance', () => {
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
}); 