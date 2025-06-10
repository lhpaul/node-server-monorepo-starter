export interface ExecutionStep {
  id: string;
}

export interface ExecutionLogger {
  lastStep: ExecutionStep;
  stepsCounter: number;
  initTime: number;
  startStep: (label: string, config?: { silent?: boolean }) => void;
  endStep: (label: string, config?: { silent?: boolean }) => void;
  getStepElapsedTime: (label: string) => number;
  getTotalElapsedTime: () => number;
  info: (data: any, message?: string) => void;
  error: (data: any, message?: string) => void;
  warn: (data: any, message?: string) => void;
  debug: (data: any, message?: string) => void;
  trace: (data: any, message?: string) => void;
}
