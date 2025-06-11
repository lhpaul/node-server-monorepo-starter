import { FirestoreCollectionRepository } from '../../../utils/repositories';
import { COLLECTION_PATH } from '../transactions.repository.constants';
import { TransactionsRepository } from '../transactions.repository';

jest.mock('../../../utils/repositories');

describe(TransactionsRepository.name, () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(TransactionsRepository.getInstance.name, () => {

    it('should create a new instance with the correct collection path', () => {
      TransactionsRepository.getInstance();
      expect(FirestoreCollectionRepository).toHaveBeenCalledWith({
        collectionPath: COLLECTION_PATH
      });
    });

    it('should return the same instance when called multiple times', () => {
      const instance1 = TransactionsRepository.getInstance();
      const instance2 = TransactionsRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
});
