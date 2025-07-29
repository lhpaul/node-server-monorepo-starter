import { InMemoryRepository } from '../../../utils/repositories/in-memory-repository.class';
import { FinancialInstitutionsRepository } from '../financial-institutions.repository';
import { MOCK_FINANCIAL_INSTITUTIONS } from '../financial-institutions.repository.constants';

jest.mock('../../../utils/repositories/in-memory-repository.class');

describe(FinancialInstitutionsRepository.name, () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(FinancialInstitutionsRepository.getInstance.name, () => {
    it('should create a new instance with the correct collection path', () => {
      FinancialInstitutionsRepository.getInstance();
      expect(InMemoryRepository).toHaveBeenCalledWith(MOCK_FINANCIAL_INSTITUTIONS);
    });

    it('should return the same instance when called multiple times', () => {
      const instance1 = FinancialInstitutionsRepository.getInstance();
      const instance2 = FinancialInstitutionsRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
});
