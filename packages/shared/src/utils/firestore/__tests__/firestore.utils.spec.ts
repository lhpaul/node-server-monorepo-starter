import { Timestamp } from 'firebase-admin/firestore';

import { ExecutionLogger } from '../../../definitions';
import { wait } from '../../time/time.utils';
import { FIRESTORE_ERROR_CODE } from '../firestore.constants';
import { DEFAULT_MAX_RETRIES, LOG_GROUP, LOGS, STEPS } from '../firestore.utils.constants';
import { CheckIfEventHasBeenProcessedError, CheckIfEventHasBeenProcessedErrorCode, RunRetriableActionError, RunRetriableActionErrorCode } from '../firestore.utils.errors';
import {
  runRetriableAction,
  runRetriableTransaction,
  changeTimestampsToDateISOString,
  changeTimestampsToDate,
  checkIfEventHasBeenProcessed,
  removeDocumentMetadata
} from '../firestore.utils';

jest.mock('../../time/time.utils', () => ({
  wait: jest.fn(),
}));

describe(runRetriableAction.name, () => {
  let mockLogger: ExecutionLogger;
  let mockActionFn: jest.Mock;
  const logGroup = `${LOG_GROUP}.${runRetriableAction.name}`;

  beforeEach(() => {
    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
      warn: jest.fn(),
    } as unknown as ExecutionLogger;

    mockActionFn = jest.fn();
  });

  it('should execute action successfully on first try', async () => {
    const expectedResult = { data: 'test' };
    mockActionFn.mockResolvedValueOnce(expectedResult);

    const result = await runRetriableAction(mockActionFn, mockLogger);

    expect(result).toEqual(expectedResult);
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.RETRIABLE_ACTION.id, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.RETRIABLE_ACTION.id);
    expect(mockActionFn).toHaveBeenCalledTimes(1);
  });

  it('should retry on internal error and succeed', async () => {
    const expectedResult = { data: 'test' };
    mockActionFn
      .mockRejectedValueOnce({ code: FIRESTORE_ERROR_CODE.INTERNAL })
      .mockResolvedValueOnce(expectedResult);

    const result = await runRetriableAction(mockActionFn, mockLogger, { maxRetries: 2 });

    expect(result).toEqual(expectedResult);
    expect(mockActionFn).toHaveBeenCalledTimes(2);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        logId: LOGS.ERROR_IN_RETRIABLE_ACTION.id,
        retries: 0,
      }),
      LOGS.ERROR_IN_RETRIABLE_ACTION.message
    );
  });

  it('should throw error after max retries', async () => {
    jest.mocked(wait).mockImplementation(() => Promise.resolve());
    try {
      mockActionFn.mockRejectedValue({ code: FIRESTORE_ERROR_CODE.INTERNAL });
      await runRetriableAction(mockActionFn, mockLogger);
    } catch (error: any) {
      expect(error).toBeInstanceOf(RunRetriableActionError);
      expect(error.code).toBe(RunRetriableActionErrorCode.MAX_RETRIES_REACHED);
    }
  });

  it('should not retry on non-retriable errors', async () => {
    const error = { code: 'NON_RETRIABLE_ERROR' };
    mockActionFn.mockRejectedValue(error);

    await expect(runRetriableAction(mockActionFn, mockLogger)).rejects.toEqual(error);
    expect(mockActionFn).toHaveBeenCalledTimes(1);
  });
});

describe(runRetriableTransaction.name, () => {
  let mockLogger: ExecutionLogger;
  let mockDb: any;
  let mockTransactionFn: jest.Mock;
  const logGroup = `${LOG_GROUP}.${runRetriableTransaction.name}`;

  beforeEach(() => {
    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
      warn: jest.fn(),
    } as unknown as ExecutionLogger;

    mockTransactionFn = jest.fn();
    mockDb = {
      runTransaction: jest.fn(),
    };
  });

  it('should execute transaction successfully on first try', async () => {
    const expectedResult = { data: 'test' };
    mockDb.runTransaction.mockResolvedValueOnce(expectedResult);

    const result = await runRetriableTransaction(mockDb, mockTransactionFn, mockLogger);

    expect(result).toEqual(expectedResult);
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.RETRIABLE_TRANSACTION.id, logGroup);
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.RETRIABLE_TRANSACTION.id);
    expect(mockDb.runTransaction).toHaveBeenCalledTimes(1);
  });

  it('should retry on contention error and succeed', async () => {
    const expectedResult = { data: 'test' };
    mockDb.runTransaction
      .mockRejectedValueOnce({ code: FIRESTORE_ERROR_CODE.TOO_MUCH_CONTENTION })
      .mockResolvedValueOnce(expectedResult);

    const result = await runRetriableTransaction(mockDb, mockTransactionFn, mockLogger, { maxRetries: 2 });

    expect(result).toEqual(expectedResult);
    expect(mockDb.runTransaction).toHaveBeenCalledTimes(2);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        logId: LOGS.ERROR_IN_RETRIABLE_TRANSACTION.id,
        retries: 0,
      }),
      LOGS.ERROR_IN_RETRIABLE_TRANSACTION.message
    );
  });

  it('should throw error after max retries', async () => {
    jest.mocked(wait).mockImplementation(() => Promise.resolve());
    mockDb.runTransaction.mockRejectedValue({ code: FIRESTORE_ERROR_CODE.INTERNAL });
    try {
      await runRetriableTransaction(mockDb, mockTransactionFn, mockLogger);
      expect(true).toBe(false);
    } catch (error: any) {
      expect(error).toBeInstanceOf(RunRetriableActionError);
      expect(error.code).toBe(RunRetriableActionErrorCode.MAX_RETRIES_REACHED);
    }
  });

  it('should throw error when transaction fails', async () => {
    const error = new Error('Transaction failed');
    mockDb.runTransaction.mockRejectedValue(error);
    await expect(runRetriableTransaction(mockDb, mockTransactionFn, mockLogger)).rejects.toThrow(error);
  });
});

describe(changeTimestampsToDateISOString.name, () => {
  it('should convert Timestamp to ISO string', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    const timestamp = new Timestamp(date.getTime() / 1000, 0);
    const input = { createdAt: timestamp };
    const expected = { createdAt: date.toISOString() };

    const result = changeTimestampsToDateISOString(input);

    expect(result).toEqual(expected);
  });

  it('should handle nested objects with Timestamps', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    const timestamp = new Timestamp(date.getTime() / 1000, 0);
    const input = {
      user: {
        createdAt: timestamp,
        profile: {
          updatedAt: timestamp,
        },
      },
    };
    const expected = {
      user: {
        createdAt: date.toISOString(),
        profile: {
          updatedAt: date.toISOString(),
        },
      },
    };

    const result = changeTimestampsToDateISOString(input);

    expect(result).toEqual(expected);
  });

  it('should handle arrays with Timestamps', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    const timestamp = new Timestamp(date.getTime() / 1000, 0);
    const input = {
      items: [
        { createdAt: timestamp },
        { createdAt: timestamp },
      ],
    };
    const expected = {
      items: [
        { createdAt: date.toISOString() },
        { createdAt: date.toISOString() },
      ],
    };

    const result = changeTimestampsToDateISOString(input);

    expect(result).toEqual(expected);
  });

  it('should handle Date objects', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    const input = { createdAt: date };
    const expected = { createdAt: date.toISOString() };

    const result = changeTimestampsToDateISOString(input);

    expect(result).toEqual(expected);
  });
});

describe(changeTimestampsToDate.name, () => {
  it('should convert Timestamp to Date', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    const timestamp = new Timestamp(date.getTime() / 1000, 0);
    const input = { createdAt: timestamp };
    const expected = { createdAt: date };

    const result = changeTimestampsToDate(input);

    expect(result).toEqual(expected);
  });

  it('should not convert existing Date objects', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    const input = { createdAt: date };
    const expected = { createdAt: date };

    const result = changeTimestampsToDate(input);

    expect(result).toEqual(expected);
  });

  it('should handle nested objects with Timestamps', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    const timestamp = new Timestamp(date.getTime() / 1000, 0);
    const input = {
      user: {
        createdAt: timestamp,
        profile: {
          updatedAt: timestamp,
        },
      },
    };
    const expected = {
      user: {
        createdAt: date,
        profile: {
          updatedAt: date,
        },
      },
    };

    const result = changeTimestampsToDate(input);

    expect(result).toEqual(expected);
  });

  it('should handle not change arrays', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    const timestamp = new Timestamp(date.getTime() / 1000, 0);
    const input = { items: [timestamp, timestamp] };

    const result = changeTimestampsToDate(input);

    expect(result).toEqual(input);
  });
});

describe(checkIfEventHasBeenProcessed.name, () => {
  let mockDb: FirebaseFirestore.Firestore;
  let mockDocRef: FirebaseFirestore.DocumentReference;
  let mockLogger: ExecutionLogger;

  beforeEach(() => {
    mockDb = {
      doc: jest.fn(),
      runTransaction: jest.fn(),
    } as unknown as FirebaseFirestore.Firestore;
    mockDocRef = {
      get: jest.fn(),
    } as unknown as FirebaseFirestore.DocumentReference;
    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
      warn: jest.fn(),
    } as unknown as ExecutionLogger;
  });

  describe('when the document exists and the field of the event is present', () => {
    let transactionMock: FirebaseFirestore.Transaction;
    let snapshotData: any;
    const eventName = 'test';

    beforeEach(() => {
      snapshotData = { [`${eventName}EventId`]: 'event-Id' };
      const snapshotMock = {
        exists: true,
        data: () => snapshotData,
      } as unknown as FirebaseFirestore.DocumentSnapshot;
      transactionMock = {
        get: jest.fn().mockResolvedValue(snapshotMock),
        update: jest.fn(),
      } as unknown as FirebaseFirestore.Transaction;
      (mockDb.runTransaction as jest.Mock).mockImplementation((fn) => fn(transactionMock));
    });

    it('should return the document data and hasBeenProcessed is true without updating the document', async () => {
      const { documentData, hasBeenProcessed } = await checkIfEventHasBeenProcessed(mockDb, mockDocRef, eventName, 'some-other-event-id', mockLogger);
      expect(documentData).toEqual(snapshotData);
      expect(hasBeenProcessed).toBe(true);
      expect(transactionMock.update).not.toHaveBeenCalled();
    });
  });

  describe('when the document exists and the field of the event is not present', () => {
    let transactionMock: FirebaseFirestore.Transaction;
    let snapshotData: any;
    const eventName = 'test';
    beforeEach(() => {
      snapshotData = {};
      const snapshotMock = {
        exists: true,
        data: () => snapshotData,
      } as unknown as FirebaseFirestore.DocumentSnapshot;
      transactionMock = {
        get: jest.fn().mockResolvedValue(snapshotMock),
        update: jest.fn(),
      } as unknown as FirebaseFirestore.Transaction;
      (mockDb.runTransaction as jest.Mock).mockImplementation((fn) => fn(transactionMock));
    });

    it('should return the document data and hasBeenProcessed is false and update the document', async () => {
      const eventId = 'event-id';
      const { documentData, hasBeenProcessed } = await checkIfEventHasBeenProcessed(mockDb, mockDocRef, eventName, eventId, mockLogger);
      expect(documentData).toEqual({
        [`${eventName}EventId`]: eventId,
        [`${eventName}Retries`]: 0,
        [`${eventName}MaxRetries`]: DEFAULT_MAX_RETRIES,
      });
      expect(hasBeenProcessed).toBe(false);
      expect(transactionMock.update).toHaveBeenCalledWith(mockDocRef, {
        [`${eventName}EventId`]: eventId,
        [`${eventName}Retries`]: 0,
        [`${eventName}MaxRetries`]: DEFAULT_MAX_RETRIES,
      });
    });
    it('should use the options maxRetries if provided', async () => {
      const eventId = 'event-id';
      const maxRetries = 10;
      const { documentData, hasBeenProcessed } = await checkIfEventHasBeenProcessed(mockDb, mockDocRef, eventName, eventId, mockLogger, { maxRetries });
      expect(documentData).toEqual({
        [`${eventName}EventId`]: eventId,
        [`${eventName}Retries`]: 0,
        [`${eventName}MaxRetries`]: maxRetries,
      });
      expect(hasBeenProcessed).toBe(false);
      expect(transactionMock.update).toHaveBeenCalledWith(mockDocRef, {
        [`${eventName}EventId`]: eventId,
        [`${eventName}Retries`]: 0,
        [`${eventName}MaxRetries`]: maxRetries,
      });
    });

    it('should throw max retries reached error if the retries are greater than the max retries', async () => {
      const eventId = 'event-id';
      const maxRetries = 3;
      (mockDb.runTransaction as jest.Mock).mockImplementation((fn) => fn({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            [`${eventName}EventId`]: undefined,
            [`${eventName}Retries`]: maxRetries,
            [`${eventName}MaxRetries`]: maxRetries,
          }),
        }),
      }));
      try {
          await checkIfEventHasBeenProcessed(mockDb, mockDocRef, eventName, eventId, mockLogger, { maxRetries });
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeInstanceOf(CheckIfEventHasBeenProcessedError);
        expect(error.code).toBe(CheckIfEventHasBeenProcessedErrorCode.MAX_RETRIES_REACHED);
      }
    });
  });

  describe('when the document does not exist', () => {
    let transactionMock: FirebaseFirestore.Transaction;
    beforeEach(() => {
      const snapshotMock = {
        exists: false,
      } as unknown as FirebaseFirestore.DocumentSnapshot;
      transactionMock = {
        get: jest.fn().mockResolvedValue(snapshotMock),
      } as unknown as FirebaseFirestore.Transaction;
      (mockDb.runTransaction as jest.Mock).mockImplementation((fn) => fn(transactionMock));
    });

    it('should throw document not found error', async () => {
      try {
        await checkIfEventHasBeenProcessed(mockDb, mockDocRef, 'testEvent', 'event-id', mockLogger);
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeInstanceOf(CheckIfEventHasBeenProcessedError);
        expect(error.code).toBe(CheckIfEventHasBeenProcessedErrorCode.DOCUMENT_NOT_FOUND);
      }
    });
  });
});

describe(removeDocumentMetadata.name, () => {
  it('should remove metadata from the document data', () => {
    const documentData = {
      normalField: 'some-value',
      _metadata: 'some-metadata',
    };
    const result = removeDocumentMetadata(documentData);
    expect(result).toEqual({
      normalField: documentData.normalField,
    });
  });
});
