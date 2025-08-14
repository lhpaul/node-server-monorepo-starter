import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { CompaniesService } from '@repo/shared/domain';
import { DomainModelServiceError, DomainModelServiceErrorCode } from '@repo/shared/utils';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../definitions/auth.interfaces';
import { hasCompanyUpdatePermission } from '../../../../../utils/permissions';
import { COMPANY_NOT_FOUND_ERROR } from '../../../companies.endpoints.constants';
import { STEPS } from '../companies.update.handler.constants';
import { updateCompanyHandler } from '../companies.update.handler';

jest.mock('@repo/fastify', () => ({
  STATUS_CODES: {
    NO_CONTENT: 204,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
  },
  FORBIDDEN_ERROR: {
    responseCode: 403,
    responseMessage: 'Forbidden'
  }
}));

jest.mock('@repo/shared/domain');

jest.mock('@repo/shared/utils', () => ({
  DomainModelServiceError: jest.fn(),
  DomainModelServiceErrorCode: jest.fn(),
}));

jest.mock('../../../../../utils/permissions', () => ({
  hasCompanyUpdatePermission: jest.fn(),
}));

describe(updateCompanyHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockService: Partial<CompaniesService>;

  const mockParams = { id: '123' };
  const mockBody = {
    name: 'Updated Company',
  };
  const mockUser: AuthUser = {
    userId: 'user123',
    companies: {
      '123': ['company:update'],
    },
  } as unknown as AuthUser;
  const logGroup = updateCompanyHandler.name;
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

    (CompaniesService.getInstance as jest.Mock).mockReturnValue(
      mockService,
    );

    (hasCompanyUpdatePermission as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully update a company', async () => {
    (hasCompanyUpdatePermission as jest.Mock).mockReturnValue(true);
    jest.spyOn(mockService, 'updateResource').mockResolvedValue(undefined);

    await updateCompanyHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_COMPANY, logGroup);
    expect(mockService.updateResource).toHaveBeenCalledWith(
      mockParams.id,
      mockBody,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_COMPANY);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle company not found', async () => {
    jest.spyOn(mockService, 'updateResource').mockRejectedValue(
      new DomainModelServiceError({
        code: DomainModelServiceErrorCode.RESOURCE_NOT_FOUND,
        message: 'Resource not found',
      }),
    );

    try {
      await updateCompanyHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(COMPANY_NOT_FOUND_ERROR(mockParams.id));
    }

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_COMPANY, logGroup);
    expect(mockService.updateResource).toHaveBeenCalledWith(
      mockParams.id,
      mockBody,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_COMPANY);
  });

  it('should handle service errors', async () => {
    const error = new Error('Service error');
    jest.spyOn(mockService, 'updateResource').mockRejectedValue(error);

    await expect(
      updateCompanyHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_COMPANY, logGroup);
    expect(mockService.updateResource).toHaveBeenCalledWith(
      mockParams.id,
      mockBody,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_COMPANY);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should return forbidden when user lacks update permission', async () => {
    (hasCompanyUpdatePermission as jest.Mock).mockReturnValue(false);

    await updateCompanyHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(hasCompanyUpdatePermission).toHaveBeenCalledWith(mockParams.id, mockUser);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.FORBIDDEN);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
    expect(mockService.updateResource).not.toHaveBeenCalled();
  });
});
