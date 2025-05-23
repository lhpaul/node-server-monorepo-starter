import { FastifyReply, FastifyRequest } from 'fastify';
import { PrivateKeysService } from '@repo/shared/services';
import {
  API_KEY_HEADER,
  UNAUTHORIZED_ERROR,
  FORBIDDEN_ERROR,
  STATUS_CODES,
  RequestLogger,
} from '@repo/fastify';
import { authenticateApiKey } from '../auth.utils';

const apiKeyHeaderMock = jest.fn();
const unauthorizedErrorMock = jest.fn();
const forbiddenErrorMock = jest.fn();
jest.mock('@repo/fastify', () => ({
  get API_KEY_HEADER() {
    return apiKeyHeaderMock();
  },
  get UNAUTHORIZED_ERROR() {
    return unauthorizedErrorMock();
  },
  get FORBIDDEN_ERROR() {
    return forbiddenErrorMock();
  },
  STATUS_CODES: {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
  },
}));
jest.mock('@repo/shared/services');

describe(authenticateApiKey.name, () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockApiKeysService: jest.Mocked<PrivateKeysService>;
  let mockLogger: jest.Mocked<RequestLogger>;

  const API_KEY_HEADER_MOCK = 'api-key';

  beforeEach(() => {
    apiKeyHeaderMock.mockReturnValue(API_KEY_HEADER_MOCK);
    mockLogger = {
      warn: jest.fn(),
      child: jest.fn(),
      level: 'info',
      fatal: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      silent: jest.fn(),
    } as unknown as jest.Mocked<RequestLogger>;

    mockRequest = {
      headers: {},
      log: mockLogger,
    };
    mockReply = {
      code: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    mockApiKeysService = {
      validatePrivateKey: jest.fn(),
    } as unknown as jest.Mocked<PrivateKeysService>;

    (PrivateKeysService.getInstance as jest.Mock).mockReturnValue(mockApiKeysService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return unauthorized error when no API key is provided', async () => {
    const UNAUTHORIZED_ERROR_MOCK = {
      logId: 'unauthorized',
      logMessage: 'Unauthorized request',
      responseCode: 'unauthorized',
      responseMessage: 'Unauthorized request',
    };
    unauthorizedErrorMock.mockReturnValue(UNAUTHORIZED_ERROR_MOCK);
    await authenticateApiKey(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockLogger.warn).toHaveBeenCalledWith(
      { logId: UNAUTHORIZED_ERROR.logId },
      UNAUTHORIZED_ERROR.logMessage
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.UNAUTHORIZED);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: UNAUTHORIZED_ERROR.responseCode,
      message: UNAUTHORIZED_ERROR.responseMessage,
    });
  });

  it('should return forbidden error when API key is invalid', async () => {
    const clientId = 'clientId';
    const apiKeyValue = 'invalidKey';
    const invalidApiKey = Buffer.from(`${clientId}:${apiKeyValue}`).toString('base64');
    mockRequest.headers = {
      [API_KEY_HEADER_MOCK]: invalidApiKey,
    };
    const FORBIDDEN_ERROR_MOCK = {
      logId: 'forbidden',
      logMessage: 'Forbidden request',
      responseCode: 'forbidden',
      responseMessage: 'Forbidden request',
    };
    forbiddenErrorMock.mockReturnValue(FORBIDDEN_ERROR_MOCK);
    mockApiKeysService.validatePrivateKey.mockResolvedValue({ isValid: false });

    await authenticateApiKey(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockApiKeysService.validatePrivateKey).toHaveBeenCalledWith(clientId, apiKeyValue);

    expect(mockLogger.warn).toHaveBeenCalledWith(
      { logId: FORBIDDEN_ERROR.logId },
      FORBIDDEN_ERROR.logMessage
    );
    expect(mockReply.code).toHaveBeenCalledWith(STATUS_CODES.FORBIDDEN);
    expect(mockReply.send).toHaveBeenCalledWith({
      code: FORBIDDEN_ERROR.responseCode,
      message: FORBIDDEN_ERROR.responseMessage,
    });
  });

  it('should call done when API key is valid', async () => {
    const validApiKey = Buffer.from('clientId:validKey').toString('base64');
    mockRequest.headers = {
      [API_KEY_HEADER]: validApiKey,
    };
    mockApiKeysService.validatePrivateKey.mockResolvedValue({ isValid: true });

    await authenticateApiKey(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockApiKeysService.validatePrivateKey).toHaveBeenCalledWith('clientId', 'validKey');
    expect(mockLogger.warn).not.toHaveBeenCalled();
    expect(mockReply.code).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
