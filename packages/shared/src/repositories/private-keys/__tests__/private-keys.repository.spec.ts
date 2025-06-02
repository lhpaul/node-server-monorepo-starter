import { FirestoreCollectionRepository } from '../../../utils/firestore/firestore-collection-repository.class';
import { COLLECTION_PATH } from '../private-keys.repository.constants';
import { PrivateKeysRepository } from '../private-keys.repository';

jest.mock('../../../utils/firestore/firestore-collection-repository.class');

describe(PrivateKeysRepository.name, () => {


  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(PrivateKeysRepository.getInstance.name, () => {
    it('should create a new instance with the correct collection path', () => {
      PrivateKeysRepository.getInstance();
      expect(FirestoreCollectionRepository).toHaveBeenCalledWith({
        collectionPath: COLLECTION_PATH
      });
    });

    it('should return the same instance when called multiple times', () => {
      const instance1 = PrivateKeysRepository.getInstance();
      const instance2 = PrivateKeysRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
});
