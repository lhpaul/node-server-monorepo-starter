import { FORBIDDEN_ERROR, STATUS_CODES } from '@repo/fastify';
import { ExamplesService } from '@repo/shared/domain';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../definitions/auth.interfaces';
import { hasExamplesCreatePermission } from '../../../../../utils/permissions/permissions.utils';
import { STEPS } from '../examples.create.handler.constants';
import { CreateExampleBody } from '../examples.create.handler.interfaces';
import { createExampleHandler } from '../examples.create.handler';

jest.mock('@repo/shared/domain');
jest.mock('../../../../../utils/permissions/permissions.utils', () => ({
  hasExamplesCreatePermission: jest.fn()
}));

describe(createExampleHandler.name, () => {
  let mockReply: Partial<FastifyReply>;
  let mockLogger: any;
  let mockService: Partial<ExamplesService>;
  const logGroup = createExampleHandler.name;
  const mockUser = { app_user_id: 'user123' } as AuthUser;

  beforeEach(() => {
    // Setup logger mock
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
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

    (ExamplesService.getInstance as jest.Mock).mockReturnValue(mockService);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('permission check', () => {
    let mockRequest: Partial<FastifyRequest>;
    beforeEach(() => {
      const mockBody = {
        description: 'Some description',
        name: 'name',
      };
      // Setup request mock
      mockRequest = {
        log: mockLogger,
        body: mockBody,
        user: mockUser,
      };
    });

    it('should return forbidden when user lacks permission', async () => {
      (hasExamplesCreatePermission as jest.Mock).mockReturnValue(false);

      await createExampleHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      );

      expect(hasExamplesCreatePermission).toHaveBeenCalledWith(mockUser);
      expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.FORBIDDEN);
      expect(mockReply.send).toHaveBeenCalledWith({
        code: FORBIDDEN_ERROR.responseCode,
        message: FORBIDDEN_ERROR.responseMessage,
      });
      expect(mockService.createResource).not.toHaveBeenCalled();
    });
  });

  describe('successful example creation', () => {
    beforeEach(() => {
      (hasExamplesCreatePermission as jest.Mock).mockReturnValue(true);
    });
    describe('when optional fields are not provided', () => {
      let mockBody: CreateExampleBody;
      let mockRequest: Partial<FastifyRequest>;
      beforeEach(() => {
        mockBody = {
          name: 'name',
        };
        mockRequest = {
          log: mockLogger,
          body: mockBody,
          user: mockUser,
        };
      });
      it('should create a example successfully, logging the right values', async () => {
        const mockExampleId = '123';
        jest.spyOn(mockService, 'createResource').mockResolvedValue(mockExampleId);

        await createExampleHandler(
          mockRequest as FastifyRequest,
          mockReply as FastifyReply,
        );

        // Verify logging
        expect(mockLogger.child).toHaveBeenCalledWith({
          handler: createExampleHandler.name,
        });
        expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CREATE_EXAMPLE, logGroup);
        expect(mockLogger.endStep).toHaveBeenCalledWith(
          STEPS.CREATE_EXAMPLE,
        );

        // Verify service call
        expect(mockService.createResource).toHaveBeenCalledWith(
          {
            description: null,
            ...mockBody,
          },
          mockLogger,
        );

        // Verify response
        expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.CREATED);
        expect(mockReply.send).toHaveBeenCalledWith({ id: mockExampleId });
      });
    });
    describe('when optional fields are provided', () => {
      let mockBody: CreateExampleBody;
      let mockRequest: Partial<FastifyRequest>;
      beforeEach(() => {
        mockBody = {
          description: 'Some description',
          name: 'name',
        };
        mockRequest = {
          log: mockLogger,
          body: mockBody,
          user: mockUser,
        };
      });
      it('should create a example successfully, logging the right values', async () => {
        const mockExampleId = '123';
        jest.spyOn(mockService, 'createResource').mockResolvedValue(mockExampleId);
        await createExampleHandler(mockRequest as FastifyRequest, mockReply as FastifyReply);
        expect(mockService.createResource).toHaveBeenCalledWith(
          mockBody,
          mockLogger,
        );
        expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.CREATE_EXAMPLE, logGroup);
        expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.CREATE_EXAMPLE);
        expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.CREATED);
        expect(mockReply.send).toHaveBeenCalledWith({ id: mockExampleId });
      });
    });
  });
});
