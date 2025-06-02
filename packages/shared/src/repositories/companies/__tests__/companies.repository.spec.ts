import { FirestoreCollectionRepository } from '../../../utils/firestore/firestore-collection-repository.class';
import { COLLECTION_PATH } from '../companies.repository.constants';
import { CompaniesRepository } from '../companies.repository';

jest.mock('../../../utils/firestore/firestore-collection-repository.class');

describe(CompaniesRepository.name, () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(CompaniesRepository.getInstance.name, () => {
    it('should create a new instance with the correct collection path', () => {
      CompaniesRepository.getInstance();
      expect(FirestoreCollectionRepository).toHaveBeenCalledWith({
        collectionPath: COLLECTION_PATH
      });
    });

    it('should return the same instance when called multiple times', () => {
      const instance1 = CompaniesRepository.getInstance();
      const instance2 = CompaniesRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
});
