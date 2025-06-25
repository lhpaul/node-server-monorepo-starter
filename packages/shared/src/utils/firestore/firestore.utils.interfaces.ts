export interface CheckIfEventHasBeenProcessedOptions {
  maxRetries?: number;
}

export interface RetriableActionOptions {
  delay?: number;
  maxRetries?: number;
}

export interface RunRetriableTransactionOptions {
  delay?: number;
  maxRetries?: number;
}
