import { TransactionsRepository } from '../../../repositories';
import { TransactionsService } from '../transactions.service';

jest.mock('../../../repositories');

describe(TransactionsService.name, () => {
  let mockTransactionsRepository: jest.Mocked<TransactionsRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTransactionsRepository = {
      // Add mock methods as needed
    } as unknown as jest.Mocked<TransactionsRepository>;

    (TransactionsRepository.getInstance as jest.Mock).mockReturnValue(mockTransactionsRepository);

    (TransactionsService as any).instance = undefined;
  });

  describe('getInstance', () => {
    it('should create a new instance if one does not exist', () => {
      const service = TransactionsService.getInstance();
      
      expect(service).toBeInstanceOf(TransactionsService);
      expect(TransactionsRepository.getInstance).toHaveBeenCalledTimes(1);
    });

    it('should return the same instance on subsequent calls', () => {
      const firstInstance = TransactionsService.getInstance();
      const secondInstance = TransactionsService.getInstance();
      
      expect(firstInstance).toBe(secondInstance);
      expect(TransactionsRepository.getInstance).toHaveBeenCalledTimes(1);
    });
  });
}); 