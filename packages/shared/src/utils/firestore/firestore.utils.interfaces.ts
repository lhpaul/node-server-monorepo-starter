export interface CheckIfEventHasBeenProcessedOptions {
  maxRetries?: number;
}

export interface RetriableActionOptions {
  delay?: number;
  maxAttempts?: number;
}

export interface RunRetriableTransactionOptions {
  delay?: number;
  maxAttempts?: number;
}
