import { TransactionType } from '@repo/shared/domain';
import { TransactionsService } from '@repo/shared/services';
import { DomainModelServiceError, DomainModelServiceErrorCode, printError } from '@repo/shared/utils';

import { ProcessStatus } from '../../../../../../definitions/models.interfaces';
import { TransactionCreateRequestsRepository } from '../../../../../../repositories/transaction-create-requests';
import { transactionCreateRequestOnCreateHandler } from '../transaction-create-request.on-create.handler';
import { STEPS } from '../transaction-create-request.on-create.constants';

jest.mock('@repo/shared/services');
jest.mock('@repo/shared/utils', () => ({
  ...jest.requireActual('@repo/shared/utils'),
  printError: jest.fn(),
}));
jest.mock('../../../../../../repositories/transaction-create-requests');

describe(transactionCreateRequestOnCreateHandler.name, () => {
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
  const mockTransactionCreateRequest = {
    id: `${companyId}-${documentId}`,
    amount: 100,
    date: '2024-01-01',
    type: TransactionType.CREDIT,
    transactionId: null,
    status: ProcessStatus.PENDING,
    error: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTransactionsService = {
    createResource: jest.fn(),
  };
  const mockTransactionCreateRequestsRepository = {
    updateDocument: jest.fn(),
  };

  beforeEach(() => {
    (TransactionsService.getInstance as jest.Mock).mockImplementation(() => mockTransactionsService);
    (TransactionCreateRequestsRepository.getInstance as jest.Mock).mockImplementation(() => mockTransactionCreateRequestsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update status to DONE when the transaction is created successfully', async () => {
    mockTransactionsService.createResource.mockResolvedValue(transactionId);
    mockTransactionCreateRequestsRepository.updateDocument.mockResolvedValue(undefined);
    await transactionCreateRequestOnCreateHandler({
      context: mockContext,
      documentData: mockTransactionCreateRequest,
      logger: mockLogger as any,
    });
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CREATE_TRANSACTION.id);
    expect(mockTransactionsService.createResource).toHaveBeenCalledWith({
      amount: mockTransactionCreateRequest.amount,
      companyId: mockContext.params.companyId,
      date: mockTransactionCreateRequest.date,
      type: mockTransactionCreateRequest.type,
    }, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.CREATE_TRANSACTION.id);
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_DONE_STATUS.id);
    expect(mockTransactionCreateRequestsRepository.updateDocument).toHaveBeenCalledWith(mockTransactionCreateRequest.id, { 
      status: ProcessStatus.DONE,
      transactionId,
    }, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_DONE_STATUS.id);
  });

  it('should update status to FAILED with INVALID_INPUT error if the transaction data is invalid', async () => {
    const errorMessage = 'Invalid input';
    const error = new DomainModelServiceError({ code: DomainModelServiceErrorCode.INVALID_INPUT, message: errorMessage });
    mockTransactionsService.createResource.mockRejectedValue(error);
    mockTransactionCreateRequestsRepository.updateDocument.mockResolvedValue(undefined);
    await transactionCreateRequestOnCreateHandler({
      context: mockContext,
      documentData: mockTransactionCreateRequest,
      logger: mockLogger as any,
    });
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_INVALID_CREATE_FAILED_STATUS.id);
    expect(mockTransactionCreateRequestsRepository.updateDocument).toHaveBeenCalledWith(mockTransactionCreateRequest.id, {
      status: ProcessStatus.FAILED,
      error: {
        code: DomainModelServiceErrorCode.INVALID_INPUT,
        message: errorMessage,
      },
    }, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_INVALID_CREATE_FAILED_STATUS.id);
  });

  it('should update status to FAILED when there is an unknown error creating the transaction', async () => {
    const error = new Error('error');
    mockTransactionsService.createResource.mockRejectedValue(error);
    mockTransactionCreateRequestsRepository.updateDocument.mockResolvedValue(undefined);
    const printedError = 'printed-error';
    (printError as jest.Mock).mockReturnValue(printedError);
    try {
      await transactionCreateRequestOnCreateHandler({
        context: mockContext,
        documentData: mockTransactionCreateRequest,
        logger: mockLogger as any,
      });
      expect(false).toBe(true);
    } catch (error) {
      expect(error).toBe(error);
    }
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_UNKNOWN_ERROR_FAILED_STATUS.id);
    expect(printError).toHaveBeenCalledWith(error);
    expect(mockTransactionCreateRequestsRepository.updateDocument).toHaveBeenCalledWith(mockTransactionCreateRequest.id, {
      status: ProcessStatus.FAILED,
      error: printedError,
    }, mockLogger);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_UNKNOWN_ERROR_FAILED_STATUS.id);
  });
}); 