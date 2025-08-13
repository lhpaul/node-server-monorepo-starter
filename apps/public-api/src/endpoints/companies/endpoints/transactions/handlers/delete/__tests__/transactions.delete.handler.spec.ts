import { FORBIDDEN_ERROR, RESOURCE_NOT_FOUND_ERROR, STATUS_CODES } from '@repo/fastify';
import { Transaction, TransactionSourceType, TransactionType } from '@repo/shared/domain';
import { TransactionsService } from '@repo/shared/domain';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../../../definitions/auth.interfaces';
import { hasCompanyTransactionsDeletePermission } from '../../../../../../../utils/permissions';
import { STEPS } from '../transactions.delete.handler.constants';
import { deleteTransactionHandler } from '../transactions.delete.handler';

jest.mock('@repo/fastify', () => ({
  STATUS_CODES: {
    NO_CONTENT: 204,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
  },
  RESOURCE_NOT_FOUND_ERROR: {
    responseCode: 'not-found',
    responseMessage: 'The requested resource was not found',
  },
  FORBIDDEN_ERROR: {
    responseCode: 403,
    responseMessage: 'Forbidden'
  }
}));

jest.mock('@repo/shared/domain');

jest.mock('../../../../../../../utils/permissions', () => ({
  hasCompanyTransactionsDeletePermission: jest.fn(),
}));

describe(deleteTransactionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockService: Partial<TransactionsService>;

  const mockParams = { companyId: 'company123', id: 'transaction123' };
  const mockUser = { app_user_id: 'user123' } as AuthUser;
  const mockTransaction: Transaction = {
    id: mockParams.id,
    amount: 100,
    categoryId: '1',
    companyId: mockParams.companyId,
    description: 'description1',
    sourceId: '1',
    sourceTransactionId: '1',
    sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
    date: '2024-03-20',
    type: TransactionType.CREDIT,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const logGroup = deleteTransactionHandler.name;
  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger as FastifyBaseLogger,
      params: mockParams,
      user: mockUser,
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      deleteResource: jest.fn(),
      getResource: jest.fn(),
    };

    (TransactionsService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );

    (hasCompanyTransactionsDeletePermission as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return forbidden when user lacks delete permission', async () => {
    (hasCompanyTransactionsDeletePermission as jest.Mock).mockReturnValue(false);

    await deleteTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockReply.code).toHaveBeenCalledWith(403);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
    expect(mockService.deleteResource).not.toHaveBeenCalled();
  });

  it('should handle transaction not found', async () => {
    jest.spyOn(mockService, 'getResource').mockResolvedValue(null);

    await deleteTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION.id, logGroup);
    expect(mockService.getResource).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: RESOURCE_NOT_FOUND_ERROR.responseCode,
      message: RESOURCE_NOT_FOUND_ERROR.responseMessage,
    });
  });

  it('should return not found when the transaction is not from the company', async () => {
    jest.spyOn(mockService, 'getResource').mockResolvedValue({
      ...mockTransaction,
      companyId: 'company456',
    });

    await deleteTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION.id, logGroup);
    expect(mockService.getResource).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
  });

  it('should successfully delete a transaction', async () => {
    (hasCompanyTransactionsDeletePermission as jest.Mock).mockReturnValue(true);
    jest.spyOn(mockService, 'deleteResource').mockResolvedValue(undefined);
    jest.spyOn(mockService, 'getResource').mockResolvedValue(mockTransaction);
    await deleteTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_TRANSACTION.id, logGroup);
    expect(mockService.deleteResource).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.DELETE_TRANSACTION.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
    expect(mockReply.send).toHaveBeenCalled();
  });
});
