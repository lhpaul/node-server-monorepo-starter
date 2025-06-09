import { BasicExecutionLogger } from '@repo/shared/utils';
import { debug, error, info, warn } from 'firebase-functions/logger';

export class FunctionLogger extends BasicExecutionLogger {
  public debug = (data: any, message?: string) =>
    debug(data, message);
  public error = (data: any, message?: string) =>
    error(data, message);
  public info = (data: any, message?: string) =>
    info(data, message);
  public warn = (data: any, message?: string) =>
    warn(data, message);
}