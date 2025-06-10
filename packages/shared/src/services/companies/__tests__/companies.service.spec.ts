import { CompaniesRepository } from '../../../repositories';
import { CompaniesService } from '../companies.service';

jest.mock('../../../repositories');

describe(CompaniesService.name, () => {
  let mockCompaniesRepository: jest.Mocked<CompaniesRepository>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create a mock repository instance
    mockCompaniesRepository = {
      // Add mock methods as needed
    } as unknown as jest.Mocked<CompaniesRepository>;

    // Setup the mock to return our mock instance
    (CompaniesRepository.getInstance as jest.Mock).mockReturnValue(mockCompaniesRepository);

    // Reset the singleton instance before each test
    (CompaniesService as any).instance = undefined;
  });

  describe('getInstance', () => {
    it('should create a new instance when one does not exist', () => {
      const service = CompaniesService.getInstance();

      expect(service).toBeInstanceOf(CompaniesService);
      expect(CompaniesRepository.getInstance).toHaveBeenCalledTimes(1);
    });

    it('should return the same instance on subsequent calls', () => {
      const firstInstance = CompaniesService.getInstance();
      const secondInstance = CompaniesService.getInstance();

      expect(firstInstance).toBe(secondInstance);
      expect(CompaniesRepository.getInstance).toHaveBeenCalledTimes(1);
    });
  });
}); 