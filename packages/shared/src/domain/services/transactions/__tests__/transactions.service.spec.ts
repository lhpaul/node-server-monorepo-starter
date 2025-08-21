// Internal modules (farthest path first, then alphabetical)
import { ExecutionLogger } from '../../../../definitions';
import { TransactionsRepository } from '../../../../repositories';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '../../../../utils';
import { TransactionSourceType, TransactionType } from '../../../entities';

// Local imports (alphabetical)
import { FinancialInstitutionService, FinancialInstitutionTransaction } from '../../financial-institution';
import { TransactionsService } from '../transactions.service';
import { ERRORS_MESSAGES } from '../transactions.service.constants';

jest.mock('../../../../repositories');
jest.mock('../../financial-institution');

describe(TransactionsService.name, () => {
  let mockTransactionsRepository: jest.Mocked<TransactionsRepository>;
  let mockFinancialInstitutionService: jest.Mocked<FinancialInstitutionService>;
  let mockLogger: jest.Mocked<ExecutionLogger>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTransactionsRepository = {
      createDocument: jest.fn(),
      createDocumentSync: jest.fn(),
      updateDocument: jest.fn(),
      updateDocumentSync: jest.fn(),
      deleteDocument: jest.fn(),
      deleteDocumentSync: jest.fn(),
      getDocumentsList: jest.fn(),
    } as unknown as jest.Mocked<TransactionsRepository>;

    mockFinancialInstitutionService = {
      getTransactions: jest.fn(),
    } as unknown as jest.Mocked<FinancialInstitutionService>;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      startStep: jest.fn(),
      endStep: jest.fn(),
      warn: jest.fn(),
    } as unknown as jest.Mocked<ExecutionLogger>;

    (TransactionsRepository.getInstance as jest.Mock).mockReturnValue(mockTransactionsRepository);
    (FinancialInstitutionService.getInstance as jest.Mock).mockReturnValue(mockFinancialInstitutionService);

    (TransactionsService as any).instance = undefined;
  });

  describe(TransactionsService.getInstance.name, () => {
    it('should create a new instance if one does not exist', () => {
      const service = TransactionsService.getInstance();
      
      expect(service).toBeInstanceOf(TransactionsService);
      expect(TransactionsRepository.getInstance).toHaveBeenCalledTimes(1);
    });

    it('should return the same instance on subsequent calls', () => {
      const firstInstance = TransactionsService.getInstance();
      const secondInstance = TransactionsService.getInstance();
      
      expect(firstInstance).toBe(secondInstance);
      expect(TransactionsRepository.getInstance).toHaveBeenCalledTimes(1);
    });
  });

  describe(TransactionsService.prototype.createResource.name, () => {
    const newDocumentId = '123';
    const baseCreateData = {
      amount: 100,
      categoryId: 'category-123',
      companyId: '123',
      description: 'Transaction description',
      sourceType: TransactionSourceType.USER,
      sourceId: 'user-123',
      sourceTransactionId: 'transaction-123',
      type: TransactionType.CREDIT,
    };
    let service: TransactionsService;

    beforeEach(() => {
      service = TransactionsService.getInstance();
    });

    it('should throw an error if the date is invalid', async () => {
      const date = '2021-13-01';
      try {
        await service.createResource({ ...baseCreateData, date }, {} as ExecutionLogger);
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeInstanceOf(DomainModelServiceError);
        expect(error.code).toBe(DomainModelServiceErrorCode.INVALID_INPUT);
        expect(error.message).toBe(ERRORS_MESSAGES.INVALID_DATE_FORMAT);
      }
    });

    it('should create a transaction if the date is valid', async () => {
      const date = '2021-01-01';
      
      (mockTransactionsRepository.createDocument as jest.Mock).mockResolvedValueOnce(newDocumentId);
      const result = await service.createResource({ ...baseCreateData, date }, {} as ExecutionLogger);
      expect(result).toBe(newDocumentId);
    });
  });

  describe(TransactionsService.prototype.updateResource.name, () => {
    let service: TransactionsService;
    const documentId = '123';
    const baseUpdateData = {
      amount: 100,
      categoryId: 'category-123',
      companyId: '123',
      description: 'Transaction description',
      sourceType: TransactionSourceType.USER,
      sourceId: 'user-123',
      sourceTransactionId: 'transaction-123',
      type: TransactionType.CREDIT,
    };

    beforeEach(() => {
      service = TransactionsService.getInstance();
    });

    it('should throw an error if the date is invalid', async () => {
      const date = '2021-13-01';
      try {
        await service.updateResource(documentId, { date }, {} as ExecutionLogger);
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeInstanceOf(DomainModelServiceError);
        expect(error.code).toBe(DomainModelServiceErrorCode.INVALID_INPUT);
        expect(error.message).toBe(ERRORS_MESSAGES.INVALID_DATE_FORMAT);
      }
    });

    it('should update a transaction if the date is valid', async () => {
      const date = '2021-01-01';
      const updateData = { ...baseUpdateData, date };
      (mockTransactionsRepository.updateDocument as jest.Mock).mockResolvedValueOnce(undefined);
      await service.updateResource(documentId, updateData, {} as ExecutionLogger);
      expect(mockTransactionsRepository.updateDocument).toHaveBeenCalledWith(documentId, updateData, {} as ExecutionLogger);
    });

    it('should update a transaction if the date is not provided', async () => {
      (mockTransactionsRepository.updateDocument as jest.Mock).mockResolvedValueOnce(undefined);
      await service.updateResource(documentId, baseUpdateData, {} as ExecutionLogger);
      expect(mockTransactionsRepository.updateDocument).toHaveBeenCalledWith(documentId, baseUpdateData, {} as ExecutionLogger);
    });
  });
}); 