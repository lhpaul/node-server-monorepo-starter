import { InMemoryRepository } from '../../../utils/repositories/in-memory-repository.class';
import { MOCK_COMPANIES } from '../companies.repository.constants';
import { CompaniesRepository } from '../companies.repository';

jest.mock('../../../utils/repositories/in-memory-repository.class');

describe(CompaniesRepository.name, () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(CompaniesRepository.getInstance.name, () => {
    it('should create a new instance with the correct collection path', () => {
      CompaniesRepository.getInstance();
      expect(InMemoryRepository).toHaveBeenCalledWith(MOCK_COMPANIES);
    });

    it('should return the same instance when called multiple times', () => {
      const instance1 = CompaniesRepository.getInstance();
      const instance2 = CompaniesRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
});
