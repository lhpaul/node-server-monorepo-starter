import { FirestoreCollectionRepository } from '../../../utils/firestore/firestore-collection-repository.class';
import { COLLECTION_PATH } from '../subscriptions.repository.constants';
import { SubscriptionsRepository } from '../subscriptions.repository';

jest.mock('../../../utils/firestore/firestore-collection-repository.class');

describe(SubscriptionsRepository.name, () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(SubscriptionsRepository.getInstance.name, () => {

    it('should create a new instance with the correct collection path', () => {
      SubscriptionsRepository.getInstance();
      expect(FirestoreCollectionRepository).toHaveBeenCalledWith({
        collectionPath: COLLECTION_PATH
      });
    });

    it('should return the same instance when called multiple times', () => {
      const instance1 = SubscriptionsRepository.getInstance();
      const instance2 = SubscriptionsRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
});
