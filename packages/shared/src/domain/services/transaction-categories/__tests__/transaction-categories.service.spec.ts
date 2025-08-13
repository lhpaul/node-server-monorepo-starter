// Internal modules (farthest path first, then alphabetical)
import { TransactionCategoriesRepository } from '../../../../repositories';

// Local imports (alphabetical)
import { TransactionCategoriesService } from '../transaction-categories.service';

jest.mock('../../../../repositories');

describe(TransactionCategoriesService.name, () => {
  let mockTransactionCategoriesRepository: jest.Mocked<TransactionCategoriesRepository>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create a mock repository instance
    mockTransactionCategoriesRepository = {
      // Add mock methods as needed
    } as unknown as jest.Mocked<TransactionCategoriesRepository>;

    // Setup the mock to return our mock instance
    (TransactionCategoriesRepository.getInstance as jest.Mock).mockReturnValue(mockTransactionCategoriesRepository);

    // Reset the singleton instance before each test
    (TransactionCategoriesService as any).instance = undefined;
  });

  describe(TransactionCategoriesService.getInstance.name, () => {
    it('should create a new instance when one does not exist', () => {
      const service = TransactionCategoriesService.getInstance();

      expect(service).toBeInstanceOf(TransactionCategoriesService);
      expect(TransactionCategoriesRepository.getInstance).toHaveBeenCalledTimes(1);
    });

    it('should return the same instance on subsequent calls', () => {
      const firstInstance = TransactionCategoriesService.getInstance();
      const secondInstance = TransactionCategoriesService.getInstance();

      expect(firstInstance).toBe(secondInstance);
      expect(TransactionCategoriesRepository.getInstance).toHaveBeenCalledTimes(1);
    });
  });
}); 