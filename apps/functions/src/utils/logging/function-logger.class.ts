import { BasicExecutionLogger } from '@repo/shared/utils';
import { debug, error, info, warn } from 'firebase-functions/logger';

export class FunctionLogger extends BasicExecutionLogger {
  public debug = (data: any, message?: string) =>
    debug(message, data);
  public error = (data: any, message?: string) =>
    error(message,data);
  public info = (data: any, message?: string) =>
    info(message, data);
  public warn = (data: any, message?: string) =>
    warn(message, data);
}