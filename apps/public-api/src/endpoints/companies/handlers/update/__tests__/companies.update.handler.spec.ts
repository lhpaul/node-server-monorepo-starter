import { FORBIDDEN_ERROR } from '@repo/fastify';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';
import {
  CompaniesRepository,
  UpdateCompanyError,
  UpdateCompanyErrorCode,
} from '@repo/shared/repositories';

import { AuthUser } from '../../../../../definitions/auth.interfaces';
import { hasCompanyUpdatePermission } from '../../../../../utils/auth/auth.utils';
import { STEPS } from '../companies.update.constants';
import { updateCompanyHandler } from '../companies.update.handler';
import { COMPANY_NOT_FOUND_ERROR } from '../../../companies.endpoints.constants';

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

jest.mock('@repo/shared/repositories', () => ({
  ...jest.requireActual('@repo/shared/repositories'),
  CompaniesRepository: {
    getInstance: jest.fn().mockImplementation(() => ({
      updateCompany: jest.fn(),
    })),
  },
}));

jest.mock('../../../../../utils/auth/auth.utils', () => ({
  hasCompanyUpdatePermission: jest.fn(),
}));

describe(updateCompanyHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockRepository: { updateCompany: jest.Mock };

  const mockParams = { id: '123' };
  const mockBody = {
    name: 'Updated Company',
  };
  const mockUser: AuthUser = {
    companies: {
      '123': ['company:update'],
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
      body: mockBody,
      user: mockUser,
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockRepository = {
      updateCompany: jest.fn(),
    };

    (CompaniesRepository.getInstance as jest.Mock).mockReturnValue(
      mockRepository,
    );

    (hasCompanyUpdatePermission as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully update a company', async () => {
    (hasCompanyUpdatePermission as jest.Mock).mockReturnValue(true);
    mockRepository.updateCompany.mockResolvedValue(undefined);

    await updateCompanyHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.UPDATE_COMPANY.id,
      STEPS.UPDATE_COMPANY.obfuscatedId,
    );
    expect(mockRepository.updateCompany).toHaveBeenCalledWith(
      mockParams.id,
      mockBody,
      { logger: mockLogger },
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_COMPANY.id);
    expect(mockReply.code).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should handle company not found', async () => {
    mockRepository.updateCompany.mockRejectedValue(
      new UpdateCompanyError({
        code: UpdateCompanyErrorCode.DOCUMENT_NOT_FOUND,
        message: 'Document not found',
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

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.UPDATE_COMPANY.id,
      STEPS.UPDATE_COMPANY.obfuscatedId,
    );
    expect(mockRepository.updateCompany).toHaveBeenCalledWith(
      mockParams.id,
      mockBody,
      { logger: mockLogger },
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_COMPANY.id);
  });

  it('should handle repository errors', async () => {
    const error = new Error('Repository error');
    mockRepository.updateCompany.mockRejectedValue(error);

    await expect(
      updateCompanyHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      STEPS.UPDATE_COMPANY.id,
      STEPS.UPDATE_COMPANY.obfuscatedId,
    );
    expect(mockRepository.updateCompany).toHaveBeenCalledWith(
      mockParams.id,
      mockBody,
      { logger: mockLogger },
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_COMPANY.id);
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
    expect(mockReply.code).toHaveBeenCalledWith(403);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
    expect(mockRepository.updateCompany).not.toHaveBeenCalled();
  });
});
