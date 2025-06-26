import { FirestoreCollectionRepository } from '@repo/shared/utils';
import { COLLECTION_PATH } from '../company-update-requests.repository.constants';
import { CompanyUpdateRequestsRepository } from '../company-update-requests.repository';

jest.mock('@repo/shared/utils');

describe(CompanyUpdateRequestsRepository.name, () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(CompanyUpdateRequestsRepository.getInstance.name, () => {

    it('should create a new instance with the correct collection path', () => {
      CompanyUpdateRequestsRepository.getInstance();
      expect(FirestoreCollectionRepository).toHaveBeenCalledWith({
        collectionPath: COLLECTION_PATH
      });
    });

    it('should return the same instance when called multiple times', () => {
      const instance1 = CompanyUpdateRequestsRepository.getInstance();
      const instance2 = CompanyUpdateRequestsRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
}); 