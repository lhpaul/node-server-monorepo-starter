import { FORBIDDEN_ERROR, RESOURCE_NOT_FOUND_ERROR, STATUS_CODES } from '@repo/fastify';
import { TransactionsRepository } from '@repo/shared/repositories';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../../../definitions/auth.interfaces';
import { hasCompanyTransactionsReadPermission } from '../../../../../../../utils/auth/auth.utils';
import { STEPS } from '../transactions.get.constants';
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

jest.mock('@repo/shared/repositories', () => ({
  ...jest.requireActual('@repo/shared/repositories'),
  TransactionsRepository: {
    getInstance: jest.fn().mockImplementation(() => ({
      getTransactionById: jest.fn(),
    })),
  },
}));

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
  let mockRepository: { getTransactionById: jest.Mock };

  const mockParams = { companyId: 'company123', id: 'transaction123' };
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
      user: mockUser,
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockRepository = {
      getTransactionById: jest.fn(),
    };

    (TransactionsRepository.getInstance as jest.Mock).mockReturnValue(
      mockRepository,
    );

    (hasCompanyTransactionsReadPermission as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully get a transaction', async () => {
    const mockTransaction = {
      id: mockParams.id,
      companyId: mockParams.companyId,
      amount: 100,
      date: '2024-03-20',
      type: 'CREDIT',
    };

    mockRepository.getTransactionById.mockResolvedValue(mockTransaction);

    await getTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.GET_TRANSACTION.id,
      STEPS.GET_TRANSACTION.obfuscatedId,
    );
    expect(mockRepository.getTransactionById).toHaveBeenCalledWith(
      mockParams.id,
      { logger: mockLogger },
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockTransaction);
  });

  it('should handle transaction not found', async () => {
    mockRepository.getTransactionById.mockResolvedValue(null);

    await getTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.GET_TRANSACTION.id,
      STEPS.GET_TRANSACTION.obfuscatedId,
    );
    expect(mockRepository.getTransactionById).toHaveBeenCalledWith(
      mockParams.id,
      { logger: mockLogger },
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: RESOURCE_NOT_FOUND_ERROR.responseCode,
      message: RESOURCE_NOT_FOUND_ERROR.responseMessage,
    });
  });

  it('should handle repository errors', async () => {
    const error = new Error('Repository error');
    mockRepository.getTransactionById.mockRejectedValue(error);

    await expect(
      getTransactionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.GET_TRANSACTION.id,
      STEPS.GET_TRANSACTION.obfuscatedId,
    );
    expect(mockRepository.getTransactionById).toHaveBeenCalledWith(
      mockParams.id,
      { logger: mockLogger },
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_TRANSACTION.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
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
    expect(mockRepository.getTransactionById).not.toHaveBeenCalled();
  });
});
