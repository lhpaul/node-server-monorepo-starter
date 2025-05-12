import { BaseLogger } from 'pino';

export interface ExecutionStep {
  id: string;
  obfuscatedId?: string; // This value is to respond on 500 errors. Check the conventions doc for more info
}

export interface ExecutionLogger extends BaseLogger {
  lastStep: ExecutionStep;
  initTime: number;
  startStep: (id: string, obfuscatedId?: string) => void;
  endStep: (id: string) => void;
  getStepElapsedTime: (id: string) => number;
  getTotalElapsedTime: () => number;
}
