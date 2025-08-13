import { FirestoreCollectionRepository } from '../../../utils/repositories';
import { COLLECTION_PATH } from '../transaction-categories.repository.constants';
import { TransactionCategoriesRepository } from '../transaction-categories.repository';

jest.mock('../../../utils/repositories');

describe(TransactionCategoriesRepository.name, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(TransactionCategoriesRepository.getInstance.name, () => {
    it('should create a new instance with the correct collection path', () => {
      TransactionCategoriesRepository.getInstance();
      expect(FirestoreCollectionRepository).toHaveBeenCalledWith({
        collectionPath: COLLECTION_PATH
      });
    });

    it('should return the same instance when called multiple times', () => {
      const instance1 = TransactionCategoriesRepository.getInstance();
      const instance2 = TransactionCategoriesRepository.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should create only one instance across multiple calls', () => {
      const instance1 = TransactionCategoriesRepository.getInstance();
      const instance2 = TransactionCategoriesRepository.getInstance();
      const instance3 = TransactionCategoriesRepository.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
      expect(instance1).toBe(instance3);
    });
  });

  describe('constructor', () => {
    it('should call parent constructor with correct collection path', () => {
      new TransactionCategoriesRepository();
      expect(FirestoreCollectionRepository).toHaveBeenCalledWith({
        collectionPath: COLLECTION_PATH
      });
    });
  });

  describe('static properties', () => {
    it('should have correct COLLECTION_PATH constant', () => {
      expect(TransactionCategoriesRepository.COLLECTION_PATH).toBe(COLLECTION_PATH);
    });
  });

  describe('inheritance', () => {
    it('should extend FirestoreCollectionRepository', () => {
      const repository = new TransactionCategoriesRepository();
      expect(repository).toBeInstanceOf(FirestoreCollectionRepository);
    });
  });
});
