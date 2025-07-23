import { ExecutionLogger, ExecutionStep } from '@repo/shared/definitions';

import { LOGS } from './basic-execution-logger.class.constants';

export class BasicExecutionLogger implements ExecutionLogger {
  public initTime: number;
  protected _activeSteps: { [label: string]: { initTime: number; group: string } } = {};
  protected _lastStep: ExecutionStep = { id: '', group: '' };
  protected _parent?: ExecutionLogger;
  protected _stepsCounter = 0;
  constructor(options?: { parent?: ExecutionLogger }) {
    this.initTime = new Date().getTime();
    this._parent = options?.parent;
  }
  get lastStep(): ExecutionStep {
    return this._lastStep;
  }
  get stepsCounter(): number {
    return this._stepsCounter;
  }
  public info = (data: any, message?: string) =>
    console.info(data, message);
  public error = (data: any, message?: string) =>
    console.error(data, message);
  public warn = (data: any, message?: string) =>
    console.warn(data, message);
  public debug = (data: any, message?: string) =>
    console.debug(data, message);
  public trace = (data: any, message?: string) =>
    console.trace(data, message);
  public fatal = (data: any, message?: string) =>
    console.error(data, message);
  getTotalElapsedTime(): number {
    return new Date().getTime() - this.initTime;
  }
  getStepElapsedTime(label: string): number {
    const step = this._activeSteps[label];
    if (!step) {
      return -1;
    }
    return new Date().getTime() - step.initTime;
  }
  startStep(
    label: string,
    group: string,
    config?: { silent?: boolean },
  ): void {
    const now = new Date().getTime();
    this._activeSteps[label] = { initTime: now, group };
    if (!config?.silent) {
      this.info({
        logId: LOGS.STEP_START.logId,
        step: label,
        group,
        totalElapsedTime: now - this.initTime,
      }, LOGS.STEP_START.logMessage(label, group));
    }
    this._lastStep = { id: label, group };
    if (this._parent) {
      this._parent.startStep(label, group, { silent: true });
    }
    this._stepsCounter++;
  }
  endStep(label: string, config?: { silent?: boolean }): void {
    const step = this._activeSteps[label];
    if (!step) {
      return;
    }
    const now = new Date().getTime();
    const elapsedTimeFromPreviousStep = now - step.initTime;
    if (!config?.silent) {
      this.info({
        logId: LOGS.STEP_END.logId,
        step: label,
        group: step.group,
        elapsedTimeFromPreviousStep,
        totalElapsedTime: now - this.initTime,
      }, LOGS.STEP_END.logMessage(label, elapsedTimeFromPreviousStep, step.group));
    }
    delete this._activeSteps[label];
    if (this._parent) {
      this._parent.endStep(label, { silent: true });
    }
  }
}
