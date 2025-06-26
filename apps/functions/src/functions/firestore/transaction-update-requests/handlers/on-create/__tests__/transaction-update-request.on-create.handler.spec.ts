import { TransactionType } from '@repo/shared/domain';
import { TransactionsService } from '@repo/shared/services';
import { DomainModelServiceError, DomainModelServiceErrorCode, printError } from '@repo/shared/utils';

import { ProcessStatus } from '../../../../../../definitions/models.interfaces';
import { TransactionUpdateRequestsRepository } from '../../../../../../repositories/transaction-update-requests';
import { transactionUpdateRequestOnCreateHandler } from '../transaction-update-request.on-create.handler';
import { ERRORS, STEPS } from '../transaction-update-request.on-create.constants';

jest.mock('@repo/shared/services');
jest.mock('@repo/shared/utils', () => ({
  ...jest.requireActual('@repo/shared/utils'),
  printError: jest.fn(),
}));
jest.mock('../../../../../../repositories/transaction-update-requests');

describe(transactionUpdateRequestOnCreateHandler.name, () => {
  const documentId = 'doc-id';
  const companyId = 'company-id';
  const transactionId = 'txn-id';
  const mockLogger = {
    startStep: jest.fn(),
    endStep: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };
  const mockContext = {
    authType: 'user',
    eventId: 'event-id',
    params: {
      companyId,
      documentId,
    },
    time: new Date().toISOString(),
  };
  const mockTransactionUpdateRequest = {
    id: `${companyId}-${documentId}`,
    transactionId,
    amount: 100,
    date: '2024-01-01',
    type: TransactionType.CREDIT,
    status: ProcessStatus.PENDING,
    error: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const mockTransaction = { id: transactionId, amount: 50, date: '2023-12-31', type: 'debit' };

  const mockTransactionsService = {
    getResource: jest.fn(),
    updateResource: jest.fn(),
  };
  const mockTransactionUpdateRequestsRepository = {
    updateDocument: jest.fn(),
  };

  beforeEach(() => {
    (TransactionsService.getInstance as jest.Mock).mockImplementation(() => mockTransactionsService);
    (TransactionUpdateRequestsRepository.getInstance as jest.Mock).mockImplementation(() => mockTransactionUpdateRequestsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update status to DONE when the transaction is updated successfully', async () => {
    mockTransactionsService.updateResource.mockResolvedValue(undefined);
    mockTransactionUpdateRequestsRepository.updateDocument.mockResolvedValue(undefined);
    await transactionUpdateRequestOnCreateHandler({
      context: mockContext,
      documentData: mockTransactionUpdateRequest,
      logger: mockLogger as any,
    });
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_TRANSACTION.id);
    expect(mockTransactionsService.updateResource).toHaveBeenCalledWith(transactionId, {
      amount: mockTransactionUpdateRequest.amount,
      date: mockTransactionUpdateRequest.date,
      type: mockTransactionUpdateRequest.type,
    }, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_TRANSACTION.id);
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_DONE_STATUS.id);
    expect(mockTransactionUpdateRequestsRepository.updateDocument).toHaveBeenCalledWith(mockTransactionUpdateRequest.id, { status: ProcessStatus.DONE }, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_DONE_STATUS.id);
  });

  it('should update status to FAILED with TRANSACTION_NOT_FOUND error if transaction does not exist', async () => {
    const error = new DomainModelServiceError({ code: DomainModelServiceErrorCode.RESOURCE_NOT_FOUND, message: 'Transaction not found' });
    mockTransactionsService.updateResource.mockRejectedValue(error);
    mockTransactionUpdateRequestsRepository.updateDocument.mockResolvedValue(undefined);
    await transactionUpdateRequestOnCreateHandler({
      context: mockContext,
      documentData: mockTransactionUpdateRequest,
      logger: mockLogger as any,
    });
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_INVALID_UPDATE_FAILED_STATUS.id);
    expect(mockTransactionUpdateRequestsRepository.updateDocument).toHaveBeenCalledWith(mockTransactionUpdateRequest.id, {
      status: ProcessStatus.FAILED,
      error: ERRORS.TRANSACTION_NOT_FOUND,
    }, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_INVALID_UPDATE_FAILED_STATUS.id);
  });

  it('should update status to FAILED with INVALID_INPUT error if the transaction is invalid', async () => {
    const errorMessage = 'Invalid input';
    const error = new DomainModelServiceError({ code: DomainModelServiceErrorCode.INVALID_INPUT, message: errorMessage });
    mockTransactionsService.updateResource.mockRejectedValue(error);
    mockTransactionUpdateRequestsRepository.updateDocument.mockResolvedValue(undefined);
    await transactionUpdateRequestOnCreateHandler({
      context: mockContext,
      documentData: mockTransactionUpdateRequest,
      logger: mockLogger as any,
    });
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_INVALID_UPDATE_FAILED_STATUS.id);
    expect(mockTransactionUpdateRequestsRepository.updateDocument).toHaveBeenCalledWith(mockTransactionUpdateRequest.id, {
      status: ProcessStatus.FAILED,
      error: {
        code: DomainModelServiceErrorCode.INVALID_INPUT,
        message: errorMessage,
      },
    }, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_INVALID_UPDATE_FAILED_STATUS.id);
  });

  it('should update status to FAILED when there is an error updating the transaction', async () => {
    const error = new Error('error');
    mockTransactionsService.updateResource.mockRejectedValue(error);
    mockTransactionUpdateRequestsRepository.updateDocument.mockResolvedValue(undefined);
    const printedError = 'printed-error';
    (printError as jest.Mock).mockReturnValue(printedError);
    try {
      await transactionUpdateRequestOnCreateHandler({
        context: mockContext,
        documentData: mockTransactionUpdateRequest,
        logger: mockLogger as any,
      });
      expect(false).toBe(true);
    } catch (error) {
      expect(error).toBe(error);
    }
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_UNKNOWN_ERROR_FAILED_STATUS.id);
    expect(printError).toHaveBeenCalledWith(error);
    expect(mockTransactionUpdateRequestsRepository.updateDocument).toHaveBeenCalledWith(mockTransactionUpdateRequest.id, {
      status: ProcessStatus.FAILED,
      error: printedError,
    }, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_UNKNOWN_ERROR_FAILED_STATUS.id);
  });
}); 