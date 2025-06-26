import { ExecutionLogger } from '../../../definitions';
import { TransactionType } from '../../../domain';
import { TransactionsRepository } from '../../../repositories';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '../../../utils';
import { TransactionsService } from '../transactions.service';
import { ERRORS_MESSAGES } from '../transactions.service.constants';

jest.mock('../../../repositories');

describe(TransactionsService.name, () => {
  let mockTransactionsRepository: jest.Mocked<TransactionsRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTransactionsRepository = {
      createDocument: jest.fn(),
      updateDocument: jest.fn(),
    } as unknown as jest.Mocked<TransactionsRepository>;

    (TransactionsRepository.getInstance as jest.Mock).mockReturnValue(mockTransactionsRepository);

    (TransactionsService as any).instance = undefined;
  });

  describe('getInstance', () => {
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
      companyId: '123',
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
      companyId: '123',
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