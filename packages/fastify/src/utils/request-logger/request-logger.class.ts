import { BasicExecutionLogger } from '@repo/shared/utils';
import { FastifyBaseLogger } from 'fastify';
import { Bindings } from 'pino';
import { ChildLoggerOptions } from 'fastify/types/logger';

export class RequestLogger extends BasicExecutionLogger {
  private _logger: FastifyBaseLogger;
  constructor(options: { logger: FastifyBaseLogger; parent?: RequestLogger }) {
    super({ parent: options.parent });
    this._logger = options.logger;
  }
  get level(): string {
    return this._logger.level;
  }
  child(bindings: Bindings, options?: ChildLoggerOptions): FastifyBaseLogger {
    return new RequestLogger({
      logger: this._logger.child(bindings, options),
      parent: this,
    });
  }
  public debug = (data: any, message?: string) =>
    this._logger.debug(data, message);
  public error = (data: any, message?: string) =>
    this._logger.error(data, message);
  public fatal = (data: any, message?: string) =>
    this._logger.fatal(data, message);
  public info = (data: any, message?: string) =>
    this._logger.info(data, message);
  public silent = (data: any, message?: string) =>
    this._logger.silent(data, message);
  public trace = (data: any, message?: string) =>
    this._logger.trace(data, message);
  public warn = (data: any, message?: string) =>
    this._logger.warn(data, message);
}
