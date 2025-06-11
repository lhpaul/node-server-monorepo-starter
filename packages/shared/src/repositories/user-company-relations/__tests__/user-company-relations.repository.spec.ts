import { FirestoreCollectionRepository } from '../../../utils/repositories';
import { COLLECTION_PATH } from '../user-company-relations.repository.constants';
import { UserCompanyRelationsRepository } from '../user-company-relations.repository';

jest.mock('../../../utils/repositories');

describe(UserCompanyRelationsRepository.name, () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(UserCompanyRelationsRepository.getInstance.name, () => {
    it('should create a new instance with the correct collection path', () => {
      UserCompanyRelationsRepository.getInstance();
      expect(FirestoreCollectionRepository).toHaveBeenCalledWith({
        collectionPath: COLLECTION_PATH
      });
    });

    it('should return the same instance when called multiple times', () => {
      const instance1 = UserCompanyRelationsRepository.getInstance();
      const instance2 = UserCompanyRelationsRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
});
