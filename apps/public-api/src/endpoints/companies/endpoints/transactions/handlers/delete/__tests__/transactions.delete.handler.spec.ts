import { FORBIDDEN_ERROR } from '@repo/fastify';
import { TransactionsRepository } from '@repo/shared/repositories';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { hasCompanyTransactionsDeletePermission } from '../../../../../../../utils/auth/auth.utils';
import { AuthUser } from '../../../../../../../definitions/auth.interfaces';
import { STEPS } from '../transactions.delete.constants';
import { deleteTransactionHandler } from '../transactions.delete.handler';


jest.mock('@repo/fastify', () => ({
  STATUS_CODES: {
    NO_CONTENT: 204,
    FORBIDDEN: 403
  },
  FORBIDDEN_ERROR: {
    responseCode: 403,
    responseMessage: 'Forbidden'
  }
}));

jest.mock('@repo/shared/repositories');

jest.mock('../../../../../../../utils/auth/auth.utils', () => ({
  hasCompanyTransactionsDeletePermission: jest.fn(),
}));

describe(deleteTransactionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockRepository: { deleteDocument: jest.Mock };

  const mockParams = { companyId: 'company123', id: 'transaction123' };
  const mockUser: AuthUser = {
    companies: {
      'company123': ['transaction:delete'],
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
      deleteDocument: jest.fn(),
    };

    (TransactionsRepository.getInstance as jest.Mock).mockReturnValue(
      mockRepository,
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
    expect(mockRepository.deleteDocument).not.toHaveBeenCalled();
  });

  it('should successfully delete a transaction', async () => {
    (hasCompanyTransactionsDeletePermission as jest.Mock).mockReturnValue(true);
    mockRepository.deleteDocument.mockResolvedValue(undefined);

    await deleteTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.DELETE_TRANSACTION.id,
      STEPS.DELETE_TRANSACTION.obfuscatedId,
    );
    expect(mockRepository.deleteDocument).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.DELETE_TRANSACTION.id);
    expect(mockReply.code).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalled();
  });
});
