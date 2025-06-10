import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { TransactionType } from '@repo/shared/domain';
import { TransactionsService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../../../definitions/auth.interfaces';
import { hasCompanyTransactionsCreatePermission } from '../../../../../../../utils/auth/auth.utils';
import { STEPS } from '../transactions.create.handler.constants';
import { createTransactionHandler } from '../transactions.create.handler';
import { CreateCompanyTransactionBody } from '../transactions.create.handler.interfaces';

// Mock dependencies
jest.mock('@repo/fastify', () => ({
  STATUS_CODES: {
    CREATED: 201,
    FORBIDDEN: 403
  },
  FORBIDDEN_ERROR: {
    responseCode: 'forbidden',
    responseMessage: 'Forbidden request'
  }
}));

jest.mock('@repo/shared/services');
jest.mock('../../../../../../../utils/auth/auth.utils', () => ({
  hasCompanyTransactionsCreatePermission: jest.fn()
}));

describe(createTransactionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: any;
  let mockService: Partial<TransactionsService>;

  const mockParams = { companyId: '123' };
  const mockUser: AuthUser = {
    companies: {
      'company-1': ['read'],
    },
  } as unknown as AuthUser;
  const mockBody = {
    amount: 100,
    date: '2024-03-20',
    type: TransactionType.CREDIT,
  } as CreateCompanyTransactionBody;

  beforeEach(() => {
    // Setup logger mock
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    // Setup request mock
    mockRequest = {
      log: mockLogger,
      body: mockBody,
      params: mockParams,
      user: mockUser,
    };

    // Setup reply mock
    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Setup service mock
    mockService = {
      createResource: jest.fn(),
    };

    (TransactionsService.getInstance as jest.Mock).mockReturnValue(mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('permission check', () => {
    it('should return forbidden when user lacks permission', async () => {
      (hasCompanyTransactionsCreatePermission as jest.Mock).mockReturnValue(false);

      await createTransactionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(hasCompanyTransactionsCreatePermission).toHaveBeenCalledWith(mockParams.companyId, mockUser);
      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.FORBIDDEN);
      expect(mockReply.send).toHaveBeenCalledWith({
        code: FORBIDDEN_ERROR.responseCode,
        message: FORBIDDEN_ERROR.responseMessage,
      });
      expect(mockService.createResource).not.toHaveBeenCalled();
    });
  });

  describe('successful transaction creation', () => {
    beforeEach(() => {
      (hasCompanyTransactionsCreatePermission as jest.Mock).mockReturnValue(true);
    });

    it('should create a transaction successfully', async () => {
      const mockTransactionId = '123';
      jest.spyOn(mockService, 'createResource').mockResolvedValue(mockTransactionId);

      await createTransactionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      // Verify logging
      expect(mockLogger.child).toHaveBeenCalledWith({
        handler: createTransactionHandler.name,
      });
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CREATE_TRANSACTION.id);
      expect(mockLogger.endStep).toHaveBeenCalledWith(
        STEPS.CREATE_TRANSACTION.id,
      );

      // Verify service call
      expect(mockService.createResource).toHaveBeenCalledWith(
        {
          ...mockBody,
          companyId: mockParams.companyId,
        } as CreateCompanyTransactionBody,
        mockLogger,
      );

      // Verify response
      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.CREATED);
      expect(mockReply.send).toHaveBeenCalledWith({ id: mockTransactionId });
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      (hasCompanyTransactionsCreatePermission as jest.Mock).mockReturnValue(true);
    });

    it('should handle service errors gracefully', async () => {
      const error = new Error('Service error');
      jest.spyOn(mockService, 'createResource').mockRejectedValue(error);

      await expect(
        createTransactionHandler(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        ),
      ).rejects.toThrow(error);

      // Verify logging still occurs
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CREATE_TRANSACTION.id);
      expect(mockLogger.endStep).toHaveBeenCalledWith(
        STEPS.CREATE_TRANSACTION.id,
      );

      // Verify no response is sent
      expect(mockReply.code).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });
  });
});
