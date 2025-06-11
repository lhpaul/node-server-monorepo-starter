import { FIRESTORE_ERROR_CODE } from './firestore.constants';
import { ExecutionLogger } from '../../definitions';
import { wait } from '../time/time.utils';
import { LOGS, RETRY_CODE, STEPS } from './firestore.utils.constants';
import { RunRetriableActionError, RunRetriableActionErrorCode } from './firestore.utils.errors';
import { RetriableActionConfig } from './firestore.utils.interfaces';

/**
 * Executes an action with retry capability for handling Firestore errors.
 * Will retry on internal errors, unavailable errors, or when explicitly requested.
 * 
 * @template T The return type of the action function
 * @param {(...args: any[]) => Promise<T>} actionFn The action function to execute
 * @param {ExecutionLogger} logger Logger instance for tracking execution
 * @param {RetriableActionConfig} [configOptions] Optional configuration for retry behavior
 * @param {number} [configOptions.delay=1000] Delay between retries in milliseconds
 * @param {number} [configOptions.maxRetries=5] Maximum number of retry attempts
 * @returns {Promise<T>} The result of the action function
 * @throws {RunRetriableActionError} When max retries are reached
 */
export function runRetriableAction<T>(actionFn: (...args: any[]) => Promise<T>, logger: ExecutionLogger, configOptions?: RetriableActionConfig): Promise<T> {
  const config = { delay: 1000, maxRetries: 5, ...configOptions };
  const runAction = async (retry = 0): Promise<T> => {
    try {
      logger.startStep(STEPS.RETRIABLE_ACTION.id);
      const result = await actionFn().finally(() => logger.endStep(STEPS.RETRIABLE_ACTION.id));
      return result;
    } catch (error: any) {
      if (typeof(error) === 'object') {
        logger.warn({
          logId: LOGS.ERROR_IN_RETRIABLE_ACTION.id,
          error,
          retries: retry,
        }, LOGS.ERROR_IN_RETRIABLE_ACTION.message);

        if (error.code === FIRESTORE_ERROR_CODE.INTERNAL
          || error.code === FIRESTORE_ERROR_CODE.UNAVAILABLE
          || error.code === RETRY_CODE) {
          if (retry >= config.maxRetries) {
            throw new RunRetriableActionError({
              code: RunRetriableActionErrorCode.MAX_RETRIES_REACHED,
              message: `Action has been retried ${config.maxRetries} times and did not finish successfully.`,
            });
          }
          await wait(error.delay || config.delay);
          return runAction(retry + 1);
        } else if (error.code) {
          logger.warn({
            logId: LOGS.UNHANDLED_ERROR_CODE.id,
            error,
            retries: retry,
          }, LOGS.UNHANDLED_ERROR_CODE.message);
        }
      }
      throw error;
    }
  };
  return runAction();
}

/**
 * Executes a Firestore transaction with retry capability.
 * Will retry on contention, internal errors, unavailable errors, or when explicitly requested.
 * 
 * @template T The return type of the transaction function
 * @param {FirebaseFirestore.Firestore} db Firestore database instance
 * @param {(transaction: FirebaseFirestore.Transaction) => Promise<T>} transactionFn The transaction function to execute
 * @param {ExecutionLogger} logger Logger instance for tracking execution
 * @param {Object} [configOptions] Optional configuration for retry behavior
 * @param {number} [configOptions.delay=1000] Delay between retries in milliseconds
 * @param {number} [configOptions.maxRetries=5] Maximum number of retry attempts
 * @returns {Promise<T>} The result of the transaction function
 * @throws {RunRetriableActionError} When max retries are reached
 */
export function runRetriableTransaction<T>(db: FirebaseFirestore.Firestore, transactionFn: (transaction: FirebaseFirestore.Transaction) => Promise<T>, logger: ExecutionLogger, configOptions?: { delay?: number; maxRetries?: number; }): Promise<T> {
  const config = { delay: 1000, maxRetries: 5, ...configOptions };
  const runTransaction = async (retry = 0): Promise<T> => {
    try {
      logger.startStep(STEPS.RETRIABLE_TRANSACTION.id);
      const result = await db.runTransaction(transactionFn).finally(() => logger.endStep(STEPS.RETRIABLE_TRANSACTION.id));
      return result;
    } catch (error: any) {
      if (typeof(error) === 'object') {
        logger.warn({
          logId: LOGS.ERROR_IN_RETRIABLE_TRANSACTION.id,
          error,
          retries: retry,
        }, LOGS.ERROR_IN_RETRIABLE_TRANSACTION.message);

        if (error.code === FIRESTORE_ERROR_CODE.TOO_MUCH_CONTENTION
          || error.code === FIRESTORE_ERROR_CODE.INTERNAL
          || error.code === FIRESTORE_ERROR_CODE.UNAVAILABLE
          || error.code === RETRY_CODE
        ) {
          if (retry >= config.maxRetries) {
            throw new RunRetriableActionError({
              code: RunRetriableActionErrorCode.MAX_RETRIES_REACHED,
              message: `Transaction has been retried ${config.maxRetries} times and did not finish successfully.`,
            });
          }
          await wait(error.delay || config.delay);
          return runTransaction(retry + 1);
        }
      }
      throw error;
    }
  };
  return runTransaction();
}

/**
 * Recursively converts all Timestamp objects in an object to ISO string format.
 * Handles nested objects and arrays, preserving array structure.
 * 
 * @param {any} obj The object containing Timestamp fields to convert
 * @returns {any} A new object with all Timestamp fields converted to ISO strings
 */
export function changeTimestampsToDateISOString(obj: any): any {
  const changedObject = Object.assign({}, obj);
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === 'object') {
      if (obj[key].constructor.name === 'Array') {
        changedObject[key] = obj[key].map((item: any) => {
          return changeTimestampsToDateISOString(item);
        });
      } else if (obj[key].constructor.name === 'Date') {
        changedObject[key] = obj[key].toISOString();
      } else if (obj[key].constructor.name === 'Timestamp') {
        changedObject[key] = obj[key].toDate().toISOString();
      } else {
        changedObject[key] = changeTimestampsToDateISOString(obj[key]);
      }
    }
  });
  return changedObject;
}

/**
 * Recursively converts all Timestamp objects in an object to Date objects.
 * Handles nested objects and arrays, preserving array structure.
 * Skips conversion if the value is already a Date object.
 * 
 * @param {any} obj The object containing Timestamp fields to convert
 * @returns {any} A new object with all Timestamp fields converted to Date objects
 */
export function changeTimestampsToDate(obj: any): any {
  const changedObject = Object.assign({}, obj);
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === 'object') {
      if (obj[key].constructor.name === 'Date') {
        return;
      } else if (obj[key].constructor.name === 'Array') {
        changedObject[key] = obj[key];
      } else if (obj[key].constructor.name === 'Timestamp') {
        changedObject[key] = obj[key].toDate();
      } else {
        changedObject[key] = changeTimestampsToDate(obj[key]);
      }
    }
  });
  return changedObject;
}
