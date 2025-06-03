import { BaseLogger } from 'pino';

export interface ExecutionStep {
  id: string;
}

export interface ExecutionLogger extends BaseLogger {
  lastStep: ExecutionStep;
  stepsCounter: number;
  initTime: number;
  startStep: (id: string) => void;
  endStep: (id: string) => void;
  getStepElapsedTime: (id: string) => number;
  getTotalElapsedTime: () => number;
}
