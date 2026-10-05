import { FirestoreCollectionRepository } from '../../../utils/repositories';
import { COLLECTION_PATH } from '../examples.repository.constants';
import { ExamplesRepository } from '../examples.repository';

jest.mock('../../../utils/repositories/firestore-collection-repository.class');

describe(ExamplesRepository.name, () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(ExamplesRepository.getInstance.name, () => {
    it('should create a new instance with the correct collection path', () => {
      ExamplesRepository.getInstance();
      expect(FirestoreCollectionRepository).toHaveBeenCalledWith({
        collectionPath: COLLECTION_PATH
      });
    });

    it('should return the same instance when called multiple times', () => {
      const instance1 = ExamplesRepository.getInstance();
      const instance2 = ExamplesRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
});