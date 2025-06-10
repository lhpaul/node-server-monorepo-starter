import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { TransactionsService, UserPermissions } from '@repo/shared/services';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { hasCompanyTransactionsUpdatePermission } from '../../../../../../../utils/auth/auth.utils';
import { ERROR_RESPONSES } from '../../../transactions.endpoints.constants';
import { STEPS } from '../transactions.update.handler.constants';
import { updateTransactionHandler } from '../transactions.update.handler';


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

jest.mock('@repo/shared/services');

jest.mock('@repo/shared/utils', () => ({
  DomainModelServiceError: jest.fn(),
  DomainModelServiceErrorCode: jest.fn(),
}));

jest.mock('../../../../../../../utils/auth/auth.utils', () => ({
  hasCompanyTransactionsUpdatePermission: jest.fn(),
}));

describe(updateTransactionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockService: Partial<TransactionsService>;

  const mockParams = { companyId: 'company123', id: 'transaction123' };
  const mockBody = { amount: 100, date: '2024-03-20', type: 'INCOME' };
  const mockUser: UserPermissions = {
    companies: {
      'company123': ['transaction:update'],
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
      body: mockBody,
      user: mockUser,
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      updateResource: jest.fn(),
    };

    (TransactionsService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );

    (hasCompanyTransactionsUpdatePermission as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully update a transaction', async () => {
    jest.spyOn(mockService, 'updateResource').mockResolvedValue(undefined);

    await updateTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_TRANSACTION.id);
    expect(mockService.updateResource).toHaveBeenCalledWith(
      mockParams.id,
      mockBody,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_TRANSACTION.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle transaction not found', async () => {
    jest.spyOn(mockService, 'updateResource').mockRejectedValue(
      new DomainModelServiceError({
        code: DomainModelServiceErrorCode.RESOURCE_NOT_FOUND,
        message: 'Transaction not found',
      }),
    );

    await updateTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_TRANSACTION.id);
    expect(mockService.updateResource).toHaveBeenCalledWith(
      mockParams.id,
      mockBody,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_TRANSACTION.id);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith(ERROR_RESPONSES.TRANSACTION_NOT_FOUND);
  });

  it('should handle service errors', async () => {
    const error = new Error('Service error');
    jest.spyOn(mockService, 'updateResource').mockRejectedValue(error);

    await expect(
      updateTransactionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_TRANSACTION.id);
    expect(mockService.updateResource).toHaveBeenCalledWith(
      mockParams.id,
      mockBody,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_TRANSACTION.id);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should return forbidden when user lacks update permission', async () => {
    (hasCompanyTransactionsUpdatePermission as jest.Mock).mockReturnValue(false);

    await updateTransactionHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.FORBIDDEN);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
    expect(mockService.updateResource).not.toHaveBeenCalled();
  });
});
