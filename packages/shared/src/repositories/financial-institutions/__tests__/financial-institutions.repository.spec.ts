import { FirestoreCollectionRepository } from '../../../utils/repositories';
import { COLLECTION_PATH } from '../financial-institutions.repository.constants';
import { FinancialInstitutionsRepository } from '../financial-institutions.repository';

jest.mock('../../../utils/repositories');

describe(FinancialInstitutionsRepository.name, () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(FinancialInstitutionsRepository.getInstance.name, () => {
    it('should create a new instance with the correct collection path', () => {
      FinancialInstitutionsRepository.getInstance();
      expect(FirestoreCollectionRepository).toHaveBeenCalledWith({
        collectionPath: COLLECTION_PATH
      });
    });

    it('should return the same instance when called multiple times', () => {
      const instance1 = FinancialInstitutionsRepository.getInstance();
      const instance2 = FinancialInstitutionsRepository.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should create only one instance across multiple calls', () => {
      const instance1 = FinancialInstitutionsRepository.getInstance();
      const instance2 = FinancialInstitutionsRepository.getInstance();
      const instance3 = FinancialInstitutionsRepository.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
      expect(instance1).toBe(instance3);
    });
  });

  describe('constructor', () => {
    it('should call parent constructor with correct collection path', () => {
      new FinancialInstitutionsRepository();
      expect(FirestoreCollectionRepository).toHaveBeenCalledWith({
        collectionPath: COLLECTION_PATH
      });
    });

    it('should call parent constructor exactly once', () => {
      new FinancialInstitutionsRepository();
      expect(FirestoreCollectionRepository).toHaveBeenCalledTimes(1);
    });
  });

  describe('static properties', () => {
    it('should have correct COLLECTION_PATH constant', () => {
      expect(FinancialInstitutionsRepository.COLLECTION_PATH).toBe(COLLECTION_PATH);
    });
  });

  describe('inheritance', () => {
    it('should extend FirestoreCollectionRepository', () => {
      const repository = new FinancialInstitutionsRepository();
      expect(repository).toBeInstanceOf(FirestoreCollectionRepository);
    });

    it('should have access to parent class methods', () => {
      const repository = new FinancialInstitutionsRepository();
      expect(typeof repository.createDocument).toBe('function');
      expect(typeof repository.getDocument).toBe('function');
      expect(typeof repository.updateDocument).toBe('function');
      expect(typeof repository.deleteDocument).toBe('function');
      expect(typeof repository.getDocumentsList).toBe('function');
    });
  });
});
