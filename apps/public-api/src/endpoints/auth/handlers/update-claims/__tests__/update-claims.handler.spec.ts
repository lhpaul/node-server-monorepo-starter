import { STATUS_CODES } from '@repo/fastify';
import { User } from '@repo/shared/domain';
import { UsersRepository } from '@repo/shared/repositories';
import { AuthService } from '@repo/shared/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { ERROR_RESPONSES, STEPS } from '../update-claims.handler.constants';
import { updateClaimsHandler } from '../update-claims.handler';

jest.mock('@repo/shared/repositories');

describe(updateClaimsHandler.name, () => {
  let mockRequest: FastifyRequest;
  let mockReply: FastifyReply;
  let mockLogger: any;
  let mockUsersRepository: Partial<UsersRepository>;

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      user: {
        aud: 'test-aud',
        auth_time: 1234567890,
        exp: 1234567890,
        firebase: {},
        iat: 1234567890,
        iss: 'test-iss',
        sub: 'test-sub',
        uid: 'test-uid',
      },
      log: mockLogger,
    } as unknown as FastifyRequest;

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as FastifyReply;

    mockUsersRepository = {
      getDocumentsList: jest.fn(),
    };

    jest.spyOn(UsersRepository, 'getInstance').mockReturnValue(mockUsersRepository as UsersRepository);
  });

  describe('when app_user_id is present', () => {
    beforeEach(() => {
      mockRequest.user = {
        ...mockRequest.user,
        app_user_id: 'test-user-id',
      };
    });

    it('should update claims and return 204', async () => {
      const mockUpdatePermissions = jest.spyOn(AuthService.getInstance(), 'updatePermissionsToUser')
        .mockResolvedValueOnce(undefined);

      await updateClaimsHandler(mockRequest, mockReply);

      expect(mockUpdatePermissions).toHaveBeenCalledWith({
        userId: 'test-user-id',
        uid: 'test-uid',
      }, mockLogger);
      expect(mockReply.status).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
      expect(mockReply.send).toHaveBeenCalled();
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_CLAIMS.id);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_CLAIMS.id);
    });
  });

  describe('when app_user_id is not present', () => {
    describe('and email is not present', () => {
      beforeEach(() => {
        mockRequest.user = {
          ...mockRequest.user,
          app_user_id: undefined,
          email: undefined,
        };
      });

      it('should return 403 with invalid token error', async () => {
        await updateClaimsHandler(mockRequest, mockReply);

        expect(mockReply.status).toHaveBeenCalledWith(STATUS_CODES.FORBIDDEN);
        expect(mockReply.send).toHaveBeenCalledWith({
          code: ERROR_RESPONSES.INVALID_TOKEN.code,
          message: ERROR_RESPONSES.INVALID_TOKEN.message,
        });
      });
    });

    describe('and email is present', () => {
      const testEmail = 'test@example.com';

      beforeEach(() => {
        mockRequest.user = {
          ...mockRequest.user,
          app_user_id: undefined,
          email: testEmail,
        };
      });

      it('should return 403 when user is not found', async () => {
        jest.spyOn(UsersRepository.getInstance(), 'getDocumentsList')
          .mockResolvedValueOnce([]);

        await updateClaimsHandler(mockRequest, mockReply);

        expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.FIND_USER.id);
        expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.FIND_USER.id);
        expect(mockReply.status).toHaveBeenCalledWith(STATUS_CODES.FORBIDDEN);
        expect(mockReply.send).toHaveBeenCalledWith({
          code: ERROR_RESPONSES.NO_USER_FOUND.code,
          message: ERROR_RESPONSES.NO_USER_FOUND.message(testEmail),
        });
      });

      it('should update claims when user is found', async () => {
        const mockUser = new User({
          id: 'found-user-id',
          email: testEmail,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        jest.spyOn(UsersRepository.getInstance(), 'getDocumentsList')
          .mockResolvedValueOnce([mockUser]);

        const mockUpdatePermissions = jest.spyOn(AuthService.getInstance(), 'updatePermissionsToUser')
          .mockResolvedValueOnce(undefined);

        await updateClaimsHandler(mockRequest, mockReply);

        expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.FIND_USER.id);
        expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.FIND_USER.id);
        expect(mockUpdatePermissions).toHaveBeenCalledWith({
          userId: mockUser.id,
          uid: 'test-uid',
        }, mockLogger);
        expect(mockReply.status).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
        expect(mockReply.send).toHaveBeenCalled();
      });
    });
  });
});
