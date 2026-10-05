import { FORBIDDEN_ERROR, STATUS_CODES, transformQueryParams } from '@repo/fastify';
import { Example, ExamplesService } from '@repo/shared/domain';
import { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../../definitions/auth.interfaces';
import { hasExamplesReadPermission } from '../../../../../utils/permissions';
import { STEPS } from '../examples.list.handler.constants';
import { listExamplesHandler } from '../examples.list.handler';

jest.mock('@repo/fastify', () => ({
  STATUS_CODES: {
    OK: 200,
    FORBIDDEN: 403,
  },
  FORBIDDEN_ERROR: {
    responseCode: 'forbidden',
    responseMessage: 'Forbidden',
  },
  transformQueryParams: jest.fn(),
}));

jest.mock('@repo/shared/domain', () => ({
  ...jest.requireActual('@repo/shared/domain'),
  ExamplesService: {
    getInstance: jest.fn(),
  },
}));

jest.mock('../../../../../utils/permissions', () => ({
  hasExamplesReadPermission: jest.fn(),
}));

describe(listExamplesHandler.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockLogger: {
    startStep: jest.Mock;
    endStep: jest.Mock;
    child: jest.Mock;
  } & Partial<FastifyBaseLogger>;
  let mockService: Partial<ExamplesService>;
  const logGroup = listExamplesHandler.name;
  const mockUser = { app_user_id: 'user123' } as AuthUser;
  const mockQuery = { ['description[eq]']: 'some description', ['name[eq]']: 'some name' };

  beforeEach(() => {
    mockLogger = {
      child: jest.fn().mockReturnThis(),
      startStep: jest.fn(),
      endStep: jest.fn(),
    };

    mockRequest = {
      log: mockLogger as FastifyBaseLogger,
      query: mockQuery,
      user: mockUser,
    };

    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    mockService = {
      getResourcesList: jest.fn(),
    };

    (ExamplesService.getInstance as jest.Mock).mockReturnValue(mockService);
    (hasExamplesReadPermission as jest.Mock).mockReturnValue(true);
    (transformQueryParams as jest.Mock).mockReturnValue({
      name: { value: 'some name', operator: '==' },
      description: { value: 'some description', operator: '==' }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return forbidden when user lacks read permission', async () => {
    (hasExamplesReadPermission as jest.Mock).mockReturnValue(false);

    await listExamplesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.FORBIDDEN);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
    expect(mockService.getResourcesList).not.toHaveBeenCalled();
  });

  it('should successfully list examples', async () => {
    const mockExamples: Example[] = [
      { id: '1', description: 'description1', name: 'name1', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', description: 'description2', name: 'name2', createdAt: new Date(), updatedAt: new Date() },
      { id: '3', description: 'description3', name: 'name3', createdAt: new Date(), updatedAt: new Date() },
    ];
    (transformQueryParams as jest.Mock).mockReturnValue(mockQuery);
    jest.spyOn(mockService, 'getResourcesList').mockResolvedValue(mockExamples);

    await listExamplesHandler(
      mockRequest as FastifyRequest,
      mockReply as FastifyReply,
    );

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_EXAMPLES, logGroup);
    expect(transformQueryParams).toHaveBeenCalledWith(mockQuery);
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      mockQuery,
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.GET_EXAMPLES);
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.OK);
    expect(mockReply.send).toHaveBeenCalledWith(mockExamples);
  });

  it('should handle service errors', async () => {
    (transformQueryParams as jest.Mock).mockReturnValue(mockQuery);
    const error = new Error('Service error');
    jest.spyOn(mockService, 'getResourcesList').mockRejectedValue(error);
    await expect(
      listExamplesHandler(
        mockRequest as FastifyRequest,
        mockReply as FastifyReply,
      ),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.GET_EXAMPLES, logGroup);
    expect(mockService.getResourcesList).toHaveBeenCalledWith(
      mockQuery,
      mockLogger,
    );
    expect(mockLogger.endStep).not.toHaveBeenCalledWith(STEPS.GET_EXAMPLES);
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
