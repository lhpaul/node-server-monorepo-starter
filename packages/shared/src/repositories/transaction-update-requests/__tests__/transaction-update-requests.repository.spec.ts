import { FirestoreCollectionRepository } from '../../../utils/repositories';
import { COLLECTION_PATH } from '../transaction-update-requests.repository.constants';
import { TransactionUpdateRequestsRepository } from '../transaction-update-requests.repository';

jest.mock('../../../utils/repositories');

describe(TransactionUpdateRequestsRepository.name, () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(TransactionUpdateRequestsRepository.getInstance.name, () => {

    it('should create a new instance with the correct collection path', () => {
      TransactionUpdateRequestsRepository.getInstance();
      expect(FirestoreCollectionRepository).toHaveBeenCalledWith({
        collectionPath: COLLECTION_PATH
      });
    });

    it('should return the same instance when called multiple times', () => {
      const instance1 = TransactionUpdateRequestsRepository.getInstance();
      const instance2 = TransactionUpdateRequestsRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
}); 