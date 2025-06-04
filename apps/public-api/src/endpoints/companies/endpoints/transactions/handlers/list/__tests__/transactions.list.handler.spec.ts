import { FORBIDDEN_ERROR, STATUS_CODES, transformQueryParams } from '@repo/fastify';
import { TransactionType } from '@repo/shared/domain';
import { TransactionsRepository } from '@repo/shared/repositories';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../../../definitions/auth.interfaces';
import { hasCompanyTransactionsReadPermission } from '../../../../../../../utils/auth/auth.utils';
import { STEPS } from '../transactions.list.constants';
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

jest.mock('@repo/shared/repositories');

jest.mock('../../../../../../../utils/auth/auth.utils', () => ({
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
  let mockRepository: Partial<TransactionsRepository>;

  const mockParams = { companyId: 'company123' };
  const mockQuery = { amount: { eq: 100 } };
  const mockUser: AuthUser = {
    companies: {
      'company123': ['transaction:read'],
    },
  } as unknown as AuthUser;

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

    mockRepository = {
      getDocumentsList: jest.fn(),
    };

    (TransactionsRepository.getInstance as jest.Mock).mockReturnValue(mockRepository);
    (hasCompanyTransactionsReadPermission as jest.Mock).mockReturnValue(true);
    (transformQueryParams as jest.Mock).mockReturnValue({ amount: { eq: 100 } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully list transactions', async () => {
    const mockTransactions = [{ id: '1', amount: 100, companyId: 'company123', createdAt: new Date(), date: '2024-03-20', type: TransactionType.CREDIT, updatedAt: new Date() }];
    jest.spyOn(mockRepository, 'getDocumentsList').mockResolvedValue(mockTransactions);

    await listTransactionsHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS.id);
    expect(transformQueryParams).toHaveBeenCalledWith(mockQuery);
    expect(mockRepository.getDocumentsList).toHaveBeenCalledWith(
      { amount: { eq: 100 } },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockTransactions);
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
    expect(mockRepository.getDocumentsList).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const error = new Error('Repository error');
    jest.spyOn(mockRepository, 'getDocumentsList').mockRejectedValue(error);

    await expect(
      listTransactionsHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS.id);
    expect(mockRepository.getDocumentsList).toHaveBeenCalledWith(
      { amount: { eq: 100 } },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTIONS.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
