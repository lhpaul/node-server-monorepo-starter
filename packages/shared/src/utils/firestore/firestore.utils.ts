import { FIRESTORE_ERROR_CODE } from './firestore.constants';
import { ExecutionLogger } from '../../definitions';
import { wait } from '../time/time.utils';
import { DEFAULT_DELAY, DEFAULT_MAX_ATTEMPTS, ERROR_MESSAGES, LOGS, RETRY_CODE, STEPS } from './firestore.utils.constants';
import { CheckIfEventHasBeenProcessedError, CheckIfEventHasBeenProcessedErrorCode, RunRetriableActionError, RunRetriableActionErrorCode } from './firestore.utils.errors';
import { CheckIfEventHasBeenProcessedOptions, RetriableActionOptions, RunRetriableTransactionOptions } from './firestore.utils.interfaces';

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

/**
 * Checks if an event has been processed by checking if the event has been processed in the database.
 * If the event has been processed, it will return the document data.
 * If the event has not been processed, it will create a new document with the event data.
 * 
 * @param {FirebaseFirestore.Firestore} db Firestore database instance
 * @param {string | FirebaseFirestore.DocumentReference} ref The reference to the document
 * @param {string} eventName The name of the event
 * @param {string} eventId The id of the event
 * @param {ExecutionLogger} logger Logger instance for tracking execution
 * @param {CheckIfEventHasBeenProcessedOptions} [options] Optional configuration for the event
 * @returns {Promise<{ documentData: any; hasBeenProcessed: boolean; }>} A promise that resolves to the document data and a boolean indicating if the event has been processed
 * @throws {CheckIfEventHasBeenProcessedError} When the document is not found or the max retries have been reached
 * @throws {RunRetriableTransactionError} When there is an error in the transaction
 *
 */
export function checkIfEventHasBeenProcessed(db: FirebaseFirestore.Firestore, ref: string | FirebaseFirestore.DocumentReference, eventName: string, eventId: string, logger: ExecutionLogger, options?: CheckIfEventHasBeenProcessedOptions): Promise<{
    documentData: any;
    hasBeenProcessed: boolean;
  }> {
  const config = {
    maxRetries: options?.maxRetries || DEFAULT_MAX_ATTEMPTS
  };
  const docRef = typeof(ref) === 'string' ? db.doc(ref) : ref;
  return runRetriableTransaction(db, (async (transaction) => {
    const snapshot = await transaction.get(docRef);
    const eventLabel = `${eventName}EventId`, eventRetriesLabel = `${eventName}Retries`, eventMaxRetriesLabel = `${eventName}MaxRetries`;
    const newData = {} as any;
    newData[eventLabel] = eventId;
    if (snapshot.exists) {
      const data = snapshot.data() as any;
      if (data[eventLabel]) {
        return { documentData: { ...data, ...newData }, hasBeenProcessed: true };
      }
      for (const key in newData) {
        if (data[key] !== undefined) {
          newData[key] = data[key];
        }
      }
      if (data[eventRetriesLabel] === undefined) {
        newData[eventRetriesLabel] = 0;
        newData[eventMaxRetriesLabel] = config.maxRetries;
      } else {
        newData[eventRetriesLabel] = (data[eventRetriesLabel] as number) + 1;
        newData[eventMaxRetriesLabel] = data[eventMaxRetriesLabel];
      }
      if (newData[eventRetriesLabel] > newData[eventMaxRetriesLabel]) {
        throw new CheckIfEventHasBeenProcessedError({
          code: CheckIfEventHasBeenProcessedErrorCode.MAX_RETRIES_REACHED,
          message: ERROR_MESSAGES.MAX_RETRIES_REACHED(eventName, eventId, newData[eventMaxRetriesLabel])
        });
      }
      transaction.update(docRef, newData);
      return { documentData: { ...data, ...newData }, hasBeenProcessed: false };
    }
    throw new CheckIfEventHasBeenProcessedError({
      code: CheckIfEventHasBeenProcessedErrorCode.DOCUMENT_NOT_FOUND,
      message: ERROR_MESSAGES.DOCUMENT_NOT_FOUND(eventName, eventId)
    });
  }), logger);
}

/**
 * Removes metadata all fields that start with an underscore.
 * 
 * @param {any} documentData The document data object to remove metadata from
 * @returns {any} A new object with the metadata removed
 */
export function removeDocumentMetadata(documentData: any): any {
  const changedObject = Object.assign({}, documentData);
  Object.keys(documentData).forEach((key) => {
    if (key.charAt(0) === '_') {
      delete changedObject[key];
    }
  });
  return changedObject;
}

/**
 * Executes an action with retry capability for handling Firestore errors.
 * Will retry on internal errors, unavailable errors, or when explicitly requested.
 * 
 * @template T The return type of the action function
 * @param {(...args: any[]) => Promise<T>} actionFn The action function to execute
 * @param {ExecutionLogger} logger Logger instance for tracking execution
 * @param {RetriableActionOptions} [options] Optional configuration for retry behavior
 * @returns {Promise<T>} The result of the action function
 * @throws {RunRetriableActionError} When max retries are reached
 */
export function runRetriableAction<T>(actionFn: (...args: any[]) => Promise<T>, logger: ExecutionLogger, options?: RetriableActionOptions): Promise<T> {
  const config = { delay: DEFAULT_DELAY, maxAttempts: DEFAULT_MAX_ATTEMPTS, ...options };
  const runAction = async (retries = 0): Promise<T> => {
    try {
      logger.startStep(STEPS.RETRIABLE_ACTION.id);
      const result = await actionFn().finally(() => logger.endStep(STEPS.RETRIABLE_ACTION.id));
      return result;
    } catch (error: any) {
      if (typeof(error) === 'object') {
        logger.warn({
          logId: LOGS.ERROR_IN_RETRIABLE_ACTION.id,
          error,
          retries,
        }, LOGS.ERROR_IN_RETRIABLE_ACTION.message);

        if (error.code === FIRESTORE_ERROR_CODE.INTERNAL
          || error.code === FIRESTORE_ERROR_CODE.UNAVAILABLE
          || error.code === RETRY_CODE) {
          if (retries >= config.maxAttempts) {
            throw new RunRetriableActionError({
              code: RunRetriableActionErrorCode.MAX_RETRIES_REACHED,
              message: ERROR_MESSAGES.ACTION_HAS_BEEN_RETRIED(config.maxAttempts)
            });
          }
          await wait(error.delay || config.delay);
          return runAction(retries + 1);
        } else if (error.code) {
          logger.warn({
            logId: LOGS.UNHANDLED_ERROR_CODE.id,
            error,
            retries,
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
 * @param {RunRetriableTransactionOptions} [options] Optional configuration for retry behavior
 * @returns {Promise<T>} The result of the transaction function
 * @throws {RunRetriableActionError} When max retries are reached
 */
export function runRetriableTransaction<T>(db: FirebaseFirestore.Firestore, transactionFn: (transaction: FirebaseFirestore.Transaction) => Promise<T>, logger: ExecutionLogger, options?: RunRetriableTransactionOptions): Promise<T> {
  const config = { delay: DEFAULT_DELAY, maxAttempts: DEFAULT_MAX_ATTEMPTS, ...options };
  const runTransaction = async (retries = 0): Promise<T> => {
    try {
      logger.startStep(STEPS.RETRIABLE_TRANSACTION.id);
      const result = await db.runTransaction(transactionFn).finally(() => logger.endStep(STEPS.RETRIABLE_TRANSACTION.id));
      return result;
    } catch (error: any) {
      if (typeof(error) === 'object') {
        logger.warn({
          logId: LOGS.ERROR_IN_RETRIABLE_TRANSACTION.id,
          error,
          retries,
        }, LOGS.ERROR_IN_RETRIABLE_TRANSACTION.message);

        if (error.code === FIRESTORE_ERROR_CODE.TOO_MUCH_CONTENTION
          || error.code === FIRESTORE_ERROR_CODE.INTERNAL
          || error.code === FIRESTORE_ERROR_CODE.UNAVAILABLE
          || error.code === RETRY_CODE
        ) {
          if (retries >= config.maxAttempts) {
            throw new RunRetriableActionError({
              code: RunRetriableActionErrorCode.MAX_RETRIES_REACHED,
              message: ERROR_MESSAGES.ACTION_HAS_BEEN_RETRIED(config.maxAttempts)
            });
          }
          await wait(error.delay || config.delay);
          return runTransaction(retries + 1);
        }
      }
      throw error;
    }
  };
  return runTransaction();
}
