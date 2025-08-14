import { STATUS_CODES } from '@repo/fastify';
import { User, UsersService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { updatePermissionsToUser } from '../../../../../utils/auth';
import { ERROR_RESPONSES, STEPS } from '../update-claims.handler.constants';
import { updateClaimsHandler } from '../update-claims.handler';


jest.mock('@repo/shared/domain', () => ({
  ...jest.requireActual('@repo/shared/domain'),
  UsersService: {
    getInstance: jest.fn(),
  },
}));
jest.mock('../../../../../utils/auth', () => ({
  ...jest.requireActual('../../../../../utils/auth'),
  updatePermissionsToUser: jest.fn(),
}));

describe(updateClaimsHandler.name, () => {
  let mockRequest: FastifyRequest;
  let mockReply: FastifyReply;
  let mockLogger: any;
  let mockUsersService: Partial<UsersService>;
  const logGroup = updateClaimsHandler.name;

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

    mockUsersService = {
      getResourcesList: jest.fn(),
    };

    jest.spyOn(UsersService, 'getInstance').mockReturnValue(mockUsersService as UsersService);
  });

  describe('when app_user_id is present', () => {
    beforeEach(() => {
      mockRequest.user = {
        ...mockRequest.user,
        app_user_id: 'test-user-id',
      };
    });

    it('should update claims and return 204', async () => {
      (updatePermissionsToUser as jest.Mock).mockResolvedValueOnce(undefined);
      await updateClaimsHandler(mockRequest, mockReply);
      expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_CLAIMS.id, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_CLAIMS.id);
      expect(updatePermissionsToUser).toHaveBeenCalledWith({
        userId: 'test-user-id',
        uid: 'test-uid',
      }, mockLogger);
      expect(mockReply.status).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
      expect(mockReply.send).toHaveBeenCalled();
      
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

        expect(mockLogger.startStep).not.toHaveBeenCalledWith(STEPS.FIND_USER.id, logGroup);
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
        (mockUsersService.getResourcesList as jest.Mock).mockResolvedValueOnce([]);

        await updateClaimsHandler(mockRequest, mockReply);

        expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.FIND_USER.id, logGroup);
        expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.FIND_USER.id);
        expect(mockReply.status).toHaveBeenCalledWith(STATUS_CODES.FORBIDDEN);
        expect(mockReply.send).toHaveBeenCalledWith({
          code: ERROR_RESPONSES.NO_USER_FOUND.code,
          message: ERROR_RESPONSES.NO_USER_FOUND.message(testEmail),
        });
        expect(mockLogger.startStep).not.toHaveBeenCalledWith(STEPS.UPDATE_CLAIMS.id, logGroup);
      });

      it('should update claims when user is found', async () => {
        const mockUser = new User({
          id: 'found-user-id',
          email: testEmail,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        (mockUsersService.getResourcesList as jest.Mock).mockResolvedValueOnce([mockUser]);
        (updatePermissionsToUser as jest.Mock).mockResolvedValueOnce(undefined);

        await updateClaimsHandler(mockRequest, mockReply);

        expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.FIND_USER.id, logGroup);
        expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.FIND_USER.id);
        expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_CLAIMS.id, logGroup);
        expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_CLAIMS.id);
        expect(updatePermissionsToUser).toHaveBeenCalledWith({
          userId: mockUser.id,
          uid: 'test-uid',
        }, mockLogger);
        expect(mockReply.status).toHaveBeenCalledWith(STATUS_CODES.NO_CONTENT);
        expect(mockReply.send).toHaveBeenCalled();
      });
    });
  });
});
