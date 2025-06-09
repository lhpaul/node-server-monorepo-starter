import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { TransactionType } from '@repo/shared/domain';
import { TransactionsRepository } from '@repo/shared/repositories';
import { FastifyReply, FastifyRequest } from 'fastify';

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

jest.mock('@repo/shared/repositories');
jest.mock('../../../../../../../utils/auth/auth.utils', () => ({
  hasCompanyTransactionsCreatePermission: jest.fn()
}));

describe(createTransactionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: any;
  let mockRepository: Partial<TransactionsRepository>;

  const mockParams = { companyId: '123' };
  const mockUser = { id: 'user123' };
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

    // Setup repository mock
    mockRepository = {
      createDocument: jest.fn(),
    };

    (TransactionsRepository.getInstance as jest.Mock).mockReturnValue(mockRepository);
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
      expect(mockRepository.createDocument).not.toHaveBeenCalled();
    });
  });

  describe('successful transaction creation', () => {
    beforeEach(() => {
      (hasCompanyTransactionsCreatePermission as jest.Mock).mockReturnValue(true);
    });

    it('should create a transaction successfully', async () => {
      const mockTransactionId = '123';
      jest.spyOn(mockRepository, 'createDocument').mockResolvedValue(mockTransactionId);

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

      // Verify repository call
      expect(mockRepository.createDocument).toHaveBeenCalledWith(
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

    it('should handle repository errors gracefully', async () => {
      const error = new Error('Repository error');
      jest.spyOn(mockRepository, 'createDocument').mockRejectedValue(error);

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
