import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { TransactionType } from '@repo/shared/domain';
import { TransactionsService } from '@repo/shared/services';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyReply, FastifyRequest } from 'fastify';

import { hasCompanyTransactionsCreatePermission } from '../../../../../../../utils/auth/auth.utils';
import { STEPS } from '../transactions.create.handler.constants';
import { createTransactionHandler } from '../transactions.create.handler';
import { CreateCompanyTransactionBody } from '../transactions.create.handler.interfaces';


jest.mock('@repo/shared/services');
jest.mock('../../../../../../../utils/auth/auth.utils', () => ({
  hasCompanyTransactionsCreatePermission: jest.fn()
}));

describe(createTransactionHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: any;
  let mockService: Partial<TransactionsService>;
  const logGroup = createTransactionHandler.name;
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
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CREATE_TRANSACTION.id, logGroup);
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

    it('should handle invalid input error', async () => {
      const errorMessage = 'Invalid input';
      const errorData = {
        date: {
          code: 'INVALID_DATE_FORMAT',
          message: 'Invalid date format',
        },
      };
      jest.spyOn(mockService, 'createResource').mockRejectedValue(
        new DomainModelServiceError({
          code: DomainModelServiceErrorCode.INVALID_INPUT,
          message: errorMessage,
          data: errorData,
        }),
      );

      await createTransactionHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CREATE_TRANSACTION.id, logGroup);
      expect(mockService.createResource).toHaveBeenCalledWith(
        {
          ...mockBody,
          companyId: mockParams.companyId,
        } as CreateCompanyTransactionBody,
        mockLogger,
      );
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.CREATE_TRANSACTION.id);
      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.BAD_REQUEST);
      expect(mockReply.send).toHaveBeenCalledWith({
        code: DomainModelServiceErrorCode.INVALID_INPUT,
        message: errorMessage,
        data: errorData,
      });
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
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CREATE_TRANSACTION.id, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(
        STEPS.CREATE_TRANSACTION.id,
      );

      // Verify no response is sent
      expect(mockReply.code).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });
  });
});
