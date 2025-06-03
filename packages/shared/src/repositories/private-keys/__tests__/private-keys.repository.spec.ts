import { InMemoryRepository } from '../../../utils/repositories/in-memory-repository.class';
import { MOCK_PRIVATE_KEYS } from '../private-keys.repository.constants';
import { PrivateKeysRepository } from '../private-keys.repository';

jest.mock('../../../utils/repositories/in-memory-repository.class');

describe(PrivateKeysRepository.name, () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(PrivateKeysRepository.getInstance.name, () => {
    it('should create a new instance with the correct collection path', () => {
      PrivateKeysRepository.getInstance();
      expect(InMemoryRepository).toHaveBeenCalledWith(MOCK_PRIVATE_KEYS);
    });

    it('should return the same instance when called multiple times', () => {
      const instance1 = PrivateKeysRepository.getInstance();
      const instance2 = PrivateKeysRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
});
