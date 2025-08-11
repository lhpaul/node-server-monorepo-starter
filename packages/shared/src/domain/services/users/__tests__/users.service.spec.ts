import { UsersRepository } from '../../../../repositories';
import { UsersService } from '../users.service';

jest.mock('../../../repositories');

describe(UsersService.name, () => {
  let mockUsersRepository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create a mock repository instance
    mockUsersRepository = {
      // Add mock methods as needed
    } as unknown as jest.Mocked<UsersRepository>;

    // Setup the mock to return our mock instance
    (UsersRepository.getInstance as jest.Mock).mockReturnValue(mockUsersRepository);

    // Reset the singleton instance before each test
    (UsersService as any).instance = undefined;
  });

  describe('getInstance', () => {
    it('should create a new instance when one does not exist', () => {
      const service = UsersService.getInstance();

      expect(service).toBeInstanceOf(UsersService);
      expect(UsersRepository.getInstance).toHaveBeenCalledTimes(1);
    });

    it('should return the same instance on subsequent calls', () => {
      const firstInstance = UsersService.getInstance();
      const secondInstance = UsersService.getInstance();

      expect(firstInstance).toBe(secondInstance);
      expect(UsersRepository.getInstance).toHaveBeenCalledTimes(1);
    });
  });
}); 