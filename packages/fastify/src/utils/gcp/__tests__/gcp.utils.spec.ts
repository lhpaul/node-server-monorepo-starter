import { getEnvVariable } from '@repo/shared/utils';
import { getStructuredLoggingConfig } from '../gcp.utils';
import { PROJECT_ID_ENV_VAR, STRUCTURED_LOGGING_KEYS } from '../gcp.utils.constants';

// Mock the shared utils module
jest.mock('@repo/shared/utils', () => ({
  getEnvVariable: jest.fn(),
}));

const mockGetEnvVariable = getEnvVariable as jest.MockedFunction<typeof getEnvVariable>;

describe('gcp.utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(getStructuredLoggingConfig.name, () => {
    it('should return a valid LoggerOptions configuration', () => {
      const config = getStructuredLoggingConfig();

      expect(config).toHaveProperty('messageKey', 'message');
      expect(config).toHaveProperty('timestamp');
      expect(config).toHaveProperty('formatters');
      expect(config.formatters).toHaveProperty('log');
      expect(config.formatters).toHaveProperty('level');
    });

    it('should set messageKey to "message"', () => {
      const config = getStructuredLoggingConfig();

      expect(config.messageKey).toBe('message');
    });

    describe('timestamp function', () => {
      it('should return a properly formatted timestamp string', () => {
        const config = getStructuredLoggingConfig();
        const timestamp = (config.timestamp as any)();

        expect(timestamp).toMatch(/^,"timestamp":"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"$/);
      });
    });

    describe('formatters.log function', () => {
      const projectId = 'test-project-id';
      beforeEach(() => {
        mockGetEnvVariable.mockReturnValue(projectId);
      });
      it('should format log object without trace context when no traceId or spanId', () => {
        const config = getStructuredLoggingConfig();
        const logObject = { message: 'test message', level: 'info' };

        const result = (config.formatters as any).log(logObject);

        expect(result).toEqual({
          message: 'test message',
          level: 'info',
        });
        expect(mockGetEnvVariable).toHaveBeenCalledWith(PROJECT_ID_ENV_VAR);
      });

      it('should format log object with trace context when traceId is present', () => {
        const config = getStructuredLoggingConfig();
        const logObject = { 
          message: 'test message', 
          level: 'info',
          traceId: 'test-trace-id',
          spanId: 'test-span-id'
        };

        const result = (config.formatters as any).log(logObject);

        expect(result).toEqual({
          [STRUCTURED_LOGGING_KEYS.TRACE_ID]: `projects/${projectId}/traces/${logObject.traceId}`,
          [STRUCTURED_LOGGING_KEYS.SPAN_ID]: logObject.spanId,
          message: 'test message',
          level: 'info',
        });
      });

      it('should format log object with trace context when only traceId is present', () => {
        const config = getStructuredLoggingConfig();
        const logObject = { 
          message: 'test message', 
          level: 'info',
          traceId: 'test-trace-id'
        };

        const result = (config.formatters as any).log(logObject);

        expect(result).toEqual({
          [STRUCTURED_LOGGING_KEYS.TRACE_ID]: `projects/${projectId}/traces/${logObject.traceId}`,
          message: 'test message',
          level: 'info',
        });
        expect(result).not.toHaveProperty(STRUCTURED_LOGGING_KEYS.SPAN_ID);
      });

      it('should format log object with trace context when only spanId is present', () => {
        const config = getStructuredLoggingConfig();
        const logObject = { 
          message: 'test message', 
          level: 'info',
          spanId: 'test-span-id'
        };

        const result = (config.formatters as any).log(logObject);

        expect(result).toEqual({
          [STRUCTURED_LOGGING_KEYS.SPAN_ID]: logObject.spanId,
          message: 'test message',
          level: 'info',
        });
        expect(result).not.toHaveProperty(STRUCTURED_LOGGING_KEYS.TRACE_ID);
      });

      it('should use traceId directly when projectId is not available', () => {
        mockGetEnvVariable.mockReturnValue(undefined);
        const config = getStructuredLoggingConfig();
        const logObject = { 
          message: 'test message', 
          level: 'info',
          traceId: 'test-trace-id',
          spanId: 'test-span-id'
        };

        const result = (config.formatters as any).log(logObject);

        expect(result).toEqual({
          [STRUCTURED_LOGGING_KEYS.TRACE_ID]: logObject.traceId,
          [STRUCTURED_LOGGING_KEYS.SPAN_ID]: logObject.spanId,
          message: 'test message',
          level: 'info',
        });
      });

      it('should preserve all other properties in the log object', () => {
        const config = getStructuredLoggingConfig();
        const logObject = { 
          message: 'test message', 
          level: 'info',
          traceId: 'test-trace-id',
          spanId: 'test-span-id',
          customField: 'custom-value',
          nestedObject: { key: 'value' },
          arrayField: [1, 2, 3]
        };

        const result = (config.formatters as any).log(logObject);

        expect(result).toEqual({
          [STRUCTURED_LOGGING_KEYS.TRACE_ID]: `projects/${projectId}/traces/${logObject.traceId}`,
          [STRUCTURED_LOGGING_KEYS.SPAN_ID]: logObject.spanId,
          message: 'test message',
          level: 'info',
          customField: 'custom-value',
          nestedObject: { key: 'value' },
          arrayField: [1, 2, 3]
        });
      });
    });

    describe('formatters.level function', () => {
      it('should map trace level to DEBUG severity', () => {
        const config = getStructuredLoggingConfig();
        const result = (config.formatters as any).level('trace');

        expect(result).toEqual({ severity: 'DEBUG' });
      });

      it('should map debug level to DEBUG severity', () => {
        const config = getStructuredLoggingConfig();
        const result = (config.formatters as any).level('debug');

        expect(result).toEqual({ severity: 'DEBUG' });
      });

      it('should map info level to INFO severity', () => {
        const config = getStructuredLoggingConfig();
        const result = (config.formatters as any).level('info');

        expect(result).toEqual({ severity: 'INFO' });
      });

      it('should map warn level to WARNING severity', () => {
        const config = getStructuredLoggingConfig();
        const result = (config.formatters as any).level('warn');

        expect(result).toEqual({ severity: 'WARNING' });
      });

      it('should map error level to ERROR severity', () => {
        const config = getStructuredLoggingConfig();
        const result = (config.formatters as any).level('error');

        expect(result).toEqual({ severity: 'ERROR' });
      });

      it('should map fatal level to CRITICAL severity', () => {
        const config = getStructuredLoggingConfig();
        const result = (config.formatters as any).level('fatal');

        expect(result).toEqual({ severity: 'CRITICAL' });
      });

      it('should default to INFO severity for unknown levels', () => {
        const config = getStructuredLoggingConfig();
        const result = (config.formatters as any).level('unknown-level');

        expect(result).toEqual({ severity: 'INFO' });
      });

      it('should default to INFO severity for undefined levels', () => {
        const config = getStructuredLoggingConfig();
        const result = (config.formatters as any).level(undefined as any);

        expect(result).toEqual({ severity: 'INFO' });
      });
    });
  });
}); 