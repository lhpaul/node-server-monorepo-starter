import { ExecutionLogger } from '../../../definitions';
import { RepositoryError, RepositoryErrorCode } from '../../../utils/repositories/repositories.errors';
import { CompaniesRepository } from '../../companies/companies.repository';
import { ERROR_MESSAGES, MOCK_SUBSCRIPTIONS } from '../subscriptions.repository.constants';
import { SubscriptionsRepository } from '../subscriptions.repository';
import { CreateSubscriptionDocumentInput } from '../subscriptions.repository.interfaces';
import { InMemoryRepository } from '../../../utils/repositories/in-memory-repository.class';

jest.mock('../../../utils/repositories/in-memory-repository.class');
jest.mock('../../companies/companies.repository');

describe(SubscriptionsRepository.name, () => {
  let repository: SubscriptionsRepository;
  let mockLogger: ExecutionLogger;

  beforeEach(() => {
    repository = SubscriptionsRepository.getInstance();
    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
      logError: jest.fn(),
    } as unknown as ExecutionLogger;

    // Reset the singleton instance before each test
    (SubscriptionsRepository as any).instance = undefined;
  });

  describe(SubscriptionsRepository.getInstance.name, () => {
    it('should create a new instance with the correct collection path', () => {
      SubscriptionsRepository.getInstance();
      expect(InMemoryRepository).toHaveBeenCalledWith(MOCK_SUBSCRIPTIONS);
    });

    it('should return the same instance when called multiple times', () => {
      const instance1 = SubscriptionsRepository.getInstance();
      const instance2 = SubscriptionsRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe(SubscriptionsRepository.prototype.createDocument.name, () => {
    const mockCreateInput: CreateSubscriptionDocumentInput = {
      companyId: '1',
      startsAt: new Date('2024-01-01'),
      endsAt: new Date('2024-12-31'),
    };

    it('should throw RepositoryError when company does not exist', async () => {
      // Mock company does not exist
      jest.spyOn(CompaniesRepository, 'getInstance').mockReturnValue({
        getDocument: jest.fn().mockResolvedValue(null),
      } as unknown as CompaniesRepository);
      try {
        await repository.createDocument(mockCreateInput, mockLogger);
        expect(false).toBe(true);
      } catch (error: any) {
        expect(error).toBeInstanceOf(RepositoryError);
        expect(error.code).toBe(RepositoryErrorCode.RELATED_DOCUMENT_NOT_FOUND);
        expect(error.message).toBe(ERROR_MESSAGES.COMPANY_NOT_FOUND);
        expect(error.data).toEqual({ companyId: mockCreateInput.companyId });
      }
      expect(CompaniesRepository.getInstance().getDocument).toHaveBeenCalledWith(mockCreateInput.companyId, mockLogger);
    });
    it('should create a subscription when company exists', async () => {
      const newSubscriptionId = '1';
      jest.spyOn(CompaniesRepository, 'getInstance').mockReturnValue({
        getDocument: jest.fn().mockResolvedValue({
          id: mockCreateInput.companyId
        }),
      } as unknown as CompaniesRepository);

      jest.spyOn(InMemoryRepository.prototype, 'createDocument').mockResolvedValue(newSubscriptionId);
      const result = await SubscriptionsRepository.getInstance().createDocument(mockCreateInput, mockLogger);
      expect(InMemoryRepository.prototype.createDocument).toHaveBeenCalledWith(mockCreateInput, mockLogger);
      expect(result).toBe(newSubscriptionId);
    });

    
  });
}); 