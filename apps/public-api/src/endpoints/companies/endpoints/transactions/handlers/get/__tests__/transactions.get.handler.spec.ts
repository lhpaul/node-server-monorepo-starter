import { FORBIDDEN_ERROR, RESOURCE_NOT_FOUND_ERROR, STATUS_CODES } from '@repo/fastify';
import { Transaction, TransactionSourceType, TransactionType } from '@repo/shared/domain';
import { TransactionsService } from '@repo/shared/services';
import { UserPermissions } from '@repo/shared/services';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { hasCompanyTransactionsReadPermission } from '../../../../../../../utils/auth/auth.utils';
import { STEPS } from '../transactions.get.handler.constants';
import { getTransactionHandler } from '../transactions.get.handler';

jest.mock('@repo/fastify', () => ({
  STATUS_CODES: {
    OK: 200,
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

jest.mock('@repo/shared/services');

jest.mock('../../../../../../../utils/auth/auth.utils', () => ({
  hasCompanyTransactionsReadPermission: jest.fn(),
}));

describe(getTransactionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockService: Partial<TransactionsService>;
  const logGroup = getTransactionHandler.name;
  const mockParams = { companyId: 'company123', id: 'transaction123' };
  const mockUser: UserPermissions = {
    companies: {
      'company123': ['transaction:read'],
    },
  };
  const mockTransaction: Transaction = {
    id: mockParams.id,
    amount: 100,
    categoryId: '1',
    description: 'description1',
    sourceType: TransactionSourceType.FINANCIAL_INSTITUTION,
    sourceId: '1',
    sourceTransactionId: '1',
    companyId: mockParams.companyId,
    date: '2024-03-20',
    type: TransactionType.CREDIT,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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
      getResource: jest.fn(),
    };

    (TransactionsService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );

    (hasCompanyTransactionsReadPermission as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return forbidden when user lacks read permission', async () => {
    (hasCompanyTransactionsReadPermission as jest.Mock).mockReturnValue(false);

    await getTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.FORBIDDEN);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
    expect(mockService.getResource).not.toHaveBeenCalled();
  });
  it('should successfully get a transaction', async () => {
    jest.spyOn(mockService, 'getResource').mockResolvedValue(mockTransaction);

    await getTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION.id, logGroup);
    expect(mockService.getResource).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockTransaction);
  });

  it('should handle transaction not found', async () => {
    jest.spyOn(mockService, 'getResource').mockResolvedValue(null);

    await getTransactionHandler(
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

    await getTransactionHandler(
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
});
