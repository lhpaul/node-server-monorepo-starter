import { STATUS_CODES } from '@repo/fastify';
import { TransactionCategoriesService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';
import { createTransactionCategoryHandler } from '../transaction-categories.create.handler';
import { CreateTransactionCategoryBody } from '../transaction-categories.create.handler.interfaces';

jest.mock('@repo/shared/domain');

describe(createTransactionCategoryHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockService: Partial<TransactionCategoriesService>;
  let mockLogger: any;
  const logGroup = createTransactionCategoryHandler.name;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger,
      body: {
        name: 'Groceries',
        type: 'expense',
      },
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      createResource: jest.fn(),
    };

    (TransactionCategoriesService.getInstance as jest.Mock).mockReturnValue(mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a transaction category successfully', async () => {
    const expectedId = 'transaction-category-123';
    jest.spyOn(mockService, 'createResource').mockResolvedValue(expectedId);

    await createTransactionCategoryHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.child).toHaveBeenCalledWith({ handler: createTransactionCategoryHandler.name });
    expect(mockLogger.startStep).toHaveBeenCalledWith('create-transaction-category', logGroup);
    expect(mockService.createResource).toHaveBeenCalledWith(
      mockRequest.body,
      mockLogger
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith('create-transaction-category');
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.CREATED);
    expect(mockReply.send).toHaveBeenCalledWith({ id: expectedId });
  });

  it('should handle service errors', async () => {
    const error = new Error('Service error');
    jest.spyOn(mockService, 'createResource').mockRejectedValue(error);

    await expect(
      createTransactionCategoryHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith('create-transaction-category', logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith('create-transaction-category');
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
}); 