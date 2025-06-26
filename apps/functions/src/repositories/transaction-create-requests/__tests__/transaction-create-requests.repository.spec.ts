import { FirestoreCollectionRepository } from '@repo/shared/utils';
import { COLLECTION_PATH } from '../transaction-create-requests.repository.constants';
import { TransactionCreateRequestsRepository } from '../transaction-create-requests.repository';

jest.mock('@repo/shared/utils');

describe(TransactionCreateRequestsRepository.name, () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(TransactionCreateRequestsRepository.getInstance.name, () => {

    it('should create a new instance with the correct collection path', () => {
      TransactionCreateRequestsRepository.getInstance();
      expect(FirestoreCollectionRepository).toHaveBeenCalledWith({
        collectionPath: COLLECTION_PATH
      });
    });

    it('should return the same instance when called multiple times', () => {
      const instance1 = TransactionCreateRequestsRepository.getInstance();
      const instance2 = TransactionCreateRequestsRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
});
