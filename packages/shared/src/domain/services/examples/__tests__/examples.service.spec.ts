import { ExamplesRepository } from '../../../../repositories';
import { ExamplesService } from '../examples.service';

jest.mock('../../../../repositories');

describe(ExamplesService.name, () => {
  let mockExampleRepository: jest.Mocked<ExamplesRepository>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create a mock repository instance
    mockExampleRepository = {
      // Add mock methods as needed
    } as unknown as jest.Mocked<ExamplesRepository>;

    // Setup the mock to return our mock instance
    (ExamplesRepository.getInstance as jest.Mock).mockReturnValue(mockExampleRepository);

    // Reset the singleton instance before each test
    (ExamplesService as any).instance = undefined;
  });

  describe('getInstance', () => {
    it('should create a new instance when one does not exist', () => {
      const service = ExamplesService.getInstance();

      expect(service).toBeInstanceOf(ExamplesService);
      expect(ExamplesRepository.getInstance).toHaveBeenCalledTimes(1);
    });

    it('should return the same instance on subsequent calls', () => {
      const firstInstance = ExamplesService.getInstance();
      const secondInstance = ExamplesService.getInstance();

      expect(firstInstance).toBe(secondInstance);
      expect(ExamplesRepository.getInstance).toHaveBeenCalledTimes(1);
    });
  });
});
