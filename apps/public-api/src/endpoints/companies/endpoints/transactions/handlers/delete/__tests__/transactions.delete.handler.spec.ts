import { FORBIDDEN_ERROR, RESOURCE_NOT_FOUND_ERROR, STATUS_CODES } from '@repo/fastify';
import { TransactionsRepository } from '@repo/shared/repositories';
import { UserPermissions } from '@repo/shared/services';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { hasCompanyTransactionsDeletePermission } from '../../../../../../../utils/auth/auth.utils';
import { STEPS } from '../transactions.delete.constants';
import { deleteTransactionHandler } from '../transactions.delete.handler';
import { RepositoryError } from '@repo/shared/utils';
import { RepositoryErrorCode } from '@repo/shared/utils';

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

jest.mock('@repo/shared/repositories');

jest.mock('@repo/shared/utils', () => ({
  RepositoryError: jest.fn(),
  RepositoryErrorCode: jest.fn(),
}));

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
  let mockRepository: Partial<TransactionsRepository>;

  const mockParams = { companyId: 'company123', id: 'transaction123' };
  const mockUser: UserPermissions = {
    companies: {
      'company123': ['transaction:delete'],
    },
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

  it('should successfully delete a transaction', async () => {
    (hasCompanyTransactionsDeletePermission as jest.Mock).mockReturnValue(true);
    jest.spyOn(mockRepository, 'deleteDocument').mockResolvedValue(undefined);

    await deleteTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_TRANSACTION.id);
    expect(mockRepository.deleteDocument).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.DELETE_TRANSACTION.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle transaction not found', async () => {
    jest.spyOn(mockRepository, 'deleteDocument').mockRejectedValue(
      new RepositoryError({
        code: RepositoryErrorCode.DOCUMENT_NOT_FOUND,
        message: 'Transaction not found',
      }),
    );

    await deleteTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_TRANSACTION.id);
    expect(mockRepository.deleteDocument).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.DELETE_TRANSACTION.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: RESOURCE_NOT_FOUND_ERROR.responseCode,
      message: RESOURCE_NOT_FOUND_ERROR.responseMessage,
    });
  });

  it('should handle repository errors', async () => {
    const error = new Error('Repository error');
    jest.spyOn(mockRepository, 'deleteDocument').mockRejectedValue(error);

    await expect(
      deleteTransactionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.DELETE_TRANSACTION.id);
    expect(mockRepository.deleteDocument).toHaveBeenCalledWith(
      mockParams.id,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.DELETE_TRANSACTION.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
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
});
