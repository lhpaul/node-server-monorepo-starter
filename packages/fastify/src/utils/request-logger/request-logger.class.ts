import { BasicExecutionLogger } from '@repo/shared/utils';
import { FastifyBaseLogger } from 'fastify';
import { ChildLoggerOptions } from 'fastify/types/logger';
import { Bindings } from 'pino';

export class RequestLogger extends BasicExecutionLogger {
  private _bindings: Bindings;
  private _logger: FastifyBaseLogger;
  constructor(options: { logger: FastifyBaseLogger, bindings?: Bindings; parent?: RequestLogger }) {
    super({ parent: options.parent });
    this._bindings = options.bindings ?? {};
    this._logger = options.logger;
  }

  get bindings(): Bindings {
    return this._bindings;
  }
  get level(): string {
    return this._logger.level;
  }

  child(bindings: Bindings, options?: ChildLoggerOptions): RequestLogger {
    return new RequestLogger({
      logger: this._logger.child(bindings, options),
      bindings: {
        ...this._bindings,
        ...bindings,
      },
      parent: this,
    });
  }
  public debug = (data: any, message?: string) =>
    this._logger.debug({
      ...this._bindings,
      ...data,
    }, message);
  public error = (data: any, message?: string) =>
    this._logger.error({
      ...this._bindings,
      ...data,
    }, message);
  public fatal = (data: any, message?: string) =>
    this._logger.fatal({
      ...this._bindings,
      ...data,
    }, message);
  public info = (data: any, message?: string) =>
    this._logger.info({
      ...this._bindings,
      ...data,
    }, message);
  public silent = (data: any, message?: string) =>
    this._logger.silent({
      ...this._bindings,
      ...data,
    }, message);
  public trace = (data: any, message?: string) =>
    this._logger.trace({
      ...this._bindings,
      ...data,
    }, message);
  public warn = (data: any, message?: string) =>
    this._logger.warn({
      ...this._bindings,
      ...data,
    }, message);
}
