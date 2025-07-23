import { getEnvVariable } from '@repo/shared/utils';
import { LoggerOptions } from 'pino';

import { PROJECT_ID_ENV_VAR, STRUCTURED_LOGGING_KEYS } from './gcp.utils.constants';

// Expected attributes that OpenTelemetry adds to correlate logs with spans
interface LogRecord {
  traceId?: string;
  spanId?: string;
  [key: string]: unknown;
}

// https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
const PinoLevelToSeverityLookup: Record<string, string | undefined> = {
  trace: 'DEBUG',
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARNING',
  error: 'ERROR',
  fatal: 'CRITICAL',
};

export function getStructuredLoggingConfig(): LoggerOptions {
  return {
    messageKey: 'message',
    // Same as pino.stdTimeFunctions.isoTime but uses "timestamp" key instead of "time"
    timestamp(): string {
      return `,"timestamp":"${new Date(Date.now()).toISOString()}"`;
    },
    formatters: {
      log(object: LogRecord): Record<string, unknown> {
        // Add trace context attributes following Cloud Logging structured log format described
        // in https://cloud.google.com/logging/docs/structured-logging#special-payload-fields
        const { traceId, spanId, ...rest} = object;
        const projectId = getEnvVariable(PROJECT_ID_ENV_VAR);
        return {
          ...(traceId && { [STRUCTURED_LOGGING_KEYS.TRACE_ID]: projectId ? `projects/${projectId}/traces/${traceId}` : traceId }),
          ...(spanId && { [STRUCTURED_LOGGING_KEYS.SPAN_ID]: spanId }),
          ...rest,
        };
      },
      // See
      // https://getpino.io/#/docs/help?id=mapping-pino-log-levels-to-google-cloud-logging-stackdriver-severity-levels
      level(label: string) {
        return {
          severity:
            PinoLevelToSeverityLookup[label] ?? PinoLevelToSeverityLookup['info'],
        };
      },
    },
  } satisfies LoggerOptions
}
