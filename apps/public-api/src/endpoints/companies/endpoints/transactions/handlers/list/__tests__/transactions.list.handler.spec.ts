import { FORBIDDEN_ERROR, STATUS_CODES, transformQueryParams } from '@repo/fastify';
import { Transaction, TransactionSourceType, TransactionType } from '@repo/shared/domain';
import { TransactionsService } from '@repo/shared/domain';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../../../definitions/auth.interfaces';
import { hasCompanyTransactionsReadPermission } from '../../../../../../../utils/permissions';
import { STEPS } from '../transactions.list.handler.constants';
import { listTransactionsHandler } from '../transactions.list.handler';

jest.mock('@repo/fastify', () => ({
  STATUS_CODES: {
    OK: 200,
    FORBIDDEN: 403,
  },
  FORBIDDEN_ERROR: {
    responseCode: 'forbidden',
    responseMessage: 'Forbidden',
  },
  transformQueryParams: jest.fn(),
}));

jest.mock('@repo/shared/domain');

jest.mock('../../../../../../../utils/permissions', () => ({
  hasCompanyTransactionsReadPermission: jest.fn(),
}));

describe(listTransactionsHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
    child: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockService: Partial<TransactionsService>;
  const logGroup = listTransactionsHandler.name;
  const mockParams = { companyId: 'company123' };
  const mockQuery = { amount: { eq: 100 } };
  const mockUser = { app_user_id: 'user123' } as AuthUser;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger as FastifyBaseLogger,
      params: mockParams,
      query: mockQuery,
      user: mockUser,
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      getResourcesList: jest.fn(),
    };

    (TransactionsService.getInstance as jest.Mock).mockReturnValue(mockService);
    (hasCompanyTransactionsReadPermission as jest.Mock).mockReturnValue(true);
    (transformQueryParams as jest.Mock).mockReturnValue({ amount: { eq: 100 } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return forbidden when user lacks read permission', async () => {
    (hasCompanyTransactionsReadPermission as jest.Mock).mockReturnValue(false);

    await listTransactionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.FORBIDDEN);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
    expect(mockService.getResourcesList).not.toHaveBeenCalled();
  });

  it('should successfully list transactions', async () => {
    const transformedQuery = { companyId: mockParams.companyId, ...mockQuery };
    const mockTransactions: Transaction[] = [
      { id: '1', amount: 100, categoryId: '1', description: 'description1', sourceType: TransactionSourceType.FINANCIAL_INSTITUTION, sourceId: '1', sourceTransactionId: '1', companyId: 'company123', createdAt: new Date(), date: '2024-03-20', type: TransactionType.CREDIT, updatedAt: new Date() },
      { id: '2', amount: 200, categoryId: '2', description: 'description2', sourceType: TransactionSourceType.FINANCIAL_INSTITUTION, sourceId: '2', sourceTransactionId: '2', companyId: 'company123', createdAt: new Date(), date: '2024-03-20', type: TransactionType.CREDIT, updatedAt: new Date() },
      { id: '3', amount: 300, categoryId: '3', description: 'description3', sourceType: TransactionSourceType.FINANCIAL_INSTITUTION, sourceId: '3', sourceTransactionId: '3', companyId: 'company123', createdAt: new Date(), date: '2024-03-20', type: TransactionType.CREDIT, updatedAt: new Date() },
    ];
    (transformQueryParams as jest.Mock).mockReturnValue(transformedQuery);
    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue(mockTransactions);

    await listTransactionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS, logGroup);
    expect(transformQueryParams).toHaveBeenCalledWith(transformedQuery);
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      transformedQuery,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockTransactions);
  });

  it('should handle service errors', async () => {
    const transformedQuery = { companyId: mockParams.companyId, ...mockQuery };
    (transformQueryParams as jest.Mock).mockReturnValue(transformedQuery);
    const error = new Error('Service error');
    jest.spyOn(mockService, 'getResourcesList').mockRejectedValue(error);
    await expect(
      listTransactionsHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS, logGroup);
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      transformedQuery,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
