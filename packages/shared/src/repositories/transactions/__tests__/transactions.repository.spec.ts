import { InMemoryRepository, RepositoryError, RepositoryErrorCode } from '../../../utils';
import { ExecutionLogger } from '../../../definitions';
import { TransactionType } from '../../../domain';
import { ERROR_MESSAGES, MOCK_TRANSACTIONS } from '../transactions.repository.constants';
import { TransactionsRepository } from '../transactions.repository';
import { CompaniesRepository } from '../../companies/companies.repository';

jest.mock('../../../utils/repositories/in-memory-repository.class');
jest.mock('../../../repositories/companies/companies.repository');

describe(TransactionsRepository.name, () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(TransactionsRepository.getInstance.name, () => {
    it('should create a new instance with the correct collection path', () => {
      TransactionsRepository.getInstance();
      expect(InMemoryRepository).toHaveBeenCalledWith(MOCK_TRANSACTIONS);
    });

    it('should return the same instance when called multiple times', () => {
      const instance1 = TransactionsRepository.getInstance();
      const instance2 = TransactionsRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe(TransactionsRepository.prototype.createDocument.name, () => {
    it('should throw a RepositoryError if the related company is not found', async () => {
      const mockLogger = {
        startStep: jest.fn(),
        endStep: jest.fn(),
      } as unknown as ExecutionLogger;
      const mockData = {
        companyId: '123',
        amount: 100,
        date: '2021-01-01',
        type: TransactionType.CREDIT,
      };
      jest.spyOn(CompaniesRepository, 'getInstance').mockReturnValue({
        getDocument: jest.fn().mockResolvedValue(null),
      } as unknown as CompaniesRepository);
      try {
        await TransactionsRepository.getInstance().createDocument(mockData, mockLogger);
      } catch (error: any) {
        expect(error).toBeInstanceOf(RepositoryError);
        expect(error.code).toBe(RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND);
        expect(error.message).toBe(ERROR_MESSAGES.COMPANY_NOT_FOUND);
        expect(error.data).toEqual({ companyId: mockData.companyId });
      }
    });

    it('should create a new transaction if the related company is found', async () => {
      const mockLogger = {
        startStep: jest.fn(),
        endStep: jest.fn(),
      } as unknown as ExecutionLogger;
      const mockData = {
        companyId: '123',
        amount: 100,
        date: '2021-01-01',
        type: TransactionType.CREDIT,
      };
      jest.spyOn(CompaniesRepository, 'getInstance').mockReturnValue({
        getDocument: jest.fn().mockResolvedValue({
          id: mockData.companyId,
          name: 'Test Company',
          ownerId: '123',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      } as unknown as CompaniesRepository);
      const newTransactionId = '1';
      jest.spyOn(InMemoryRepository.prototype, 'createDocument').mockResolvedValue(newTransactionId);
      const result = await TransactionsRepository.getInstance().createDocument(mockData, mockLogger);
      expect(InMemoryRepository.prototype.createDocument).toHaveBeenCalledWith(mockData, mockLogger);
      expect(result).toBe(newTransactionId);
    });
  });
});
