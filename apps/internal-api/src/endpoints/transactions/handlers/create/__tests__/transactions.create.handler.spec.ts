import { STATUS_CODES } from '@repo/fastify';
import { TransactionSourceType, TransactionType } from '@repo/shared/domain';
import { TransactionsService } from '@repo/shared/domain';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES } from '../../../transactions.endpoints.constants';
import { createTransactionHandler } from '../transactions.create.handler';
import { STEPS } from '../transactions.create.handler.constants';
import { CreateTransactionBody } from '../transactions.create.handler.interfaces';

jest.mock('@repo/shared/domain');

describe(createTransactionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: Partial<FastifyBaseLogger>;
  let mockService: Partial<TransactionsService>;
  const logGroup = createTransactionHandler.name;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger as FastifyBaseLogger,
      body: {
        amount: 100,
        date: '2024-03-20',
        type: TransactionType.CREDIT,
        sourceId: 'sourceId',
        sourceTransactionId: 'sourceTransactionId',
        sourceType: TransactionSourceType.USER,
      },
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      createResource: jest.fn(),
    };

    (TransactionsService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a transaction successfully', async () => {
    const mockTransactionId = '123';
    jest.spyOn(mockService, 'createResource').mockResolvedValue(mockTransactionId);

    await createTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.child).toHaveBeenCalledWith({
      handler: createTransactionHandler.name,
    });
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CREATE_TRANSACTION.id, logGroup);
    expect(mockService.createResource).toHaveBeenCalledWith(
      {
        description: null,
        categoryId: null,
        ...(mockRequest.body as CreateTransactionBody),
      },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.CREATE_TRANSACTION.id,
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.CREATED);
    expect(mockReply.send).toHaveBeenCalledWith({ id: mockTransactionId });
  });

  it('should handle company not found', async () => {
    const mockError = new DomainModelServiceError({
      code: DomainModelServiceErrorCode.RELATED_RESOURCE_NOT_FOUND,
      message: 'Related document not found',
    });
    jest.spyOn(mockService, 'createResource').mockRejectedValue(mockError);

    await createTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.BAD_REQUEST);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: ERROR_RESPONSES.COMPANY_NOT_FOUND.code,
      message: ERROR_RESPONSES.COMPANY_NOT_FOUND.message((mockRequest.body as any).companyId as string),
    });
  });

  it('should handle invalid input error', async () => {
    const errorMessage = 'Invalid input';
    const errorData = {
      date: {
        code: 'INVALID_DATE_FORMAT',
        message: 'Invalid date format',
      },
    };
    const mockError = new DomainModelServiceError({
      code: DomainModelServiceErrorCode.INVALID_INPUT,
      message: errorMessage,
      data: errorData,
    });
    jest.spyOn(mockService, 'createResource').mockRejectedValue(mockError);

    await createTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CREATE_TRANSACTION.id, logGroup);
    expect(mockService.createResource).toHaveBeenCalledWith(
      {
        description: null,
        categoryId: null,
        ...(mockRequest.body as CreateTransactionBody),
      },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.CREATE_TRANSACTION.id,
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.BAD_REQUEST);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: DomainModelServiceErrorCode.INVALID_INPUT,
      message: errorMessage,
      data: errorData,
    });
  });

  it('should handle service unknown errors', async () => {
    const mockError = new Error('Service error');
    jest.spyOn(mockService, 'createResource').mockRejectedValue(mockError);

    await expect(
      createTransactionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(mockError);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CREATE_TRANSACTION.id, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      STEPS.CREATE_TRANSACTION.id,
    );
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
