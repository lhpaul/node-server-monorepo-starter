import { FirestoreCollectionRepository } from '../../../utils/repositories';
import { COLLECTION_PATH } from '../users.repository.constants';
import { UsersRepository } from '../users.repository';

jest.mock('../../../utils/repositories');

describe(UsersRepository.name, () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(UsersRepository.getInstance.name, () => {
    it('should create a new instance with the correct collection path', () => {
      UsersRepository.getInstance();
      expect(FirestoreCollectionRepository).toHaveBeenCalledWith({
        collectionPath: COLLECTION_PATH
      });
    });

    it('should return the same instance when called multiple times', () => {
      const instance1 = UsersRepository.getInstance();
      const instance2 = UsersRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
});
