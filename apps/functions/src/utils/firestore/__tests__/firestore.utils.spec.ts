import { maskFields } from '@repo/shared/utils';
import { onDocumentWrittenWithAuthContext } from 'firebase-functions/v2/firestore';

import { collectionOnWriteFunctionWrapper } from '../firestore.utils';
import { DEFAULT_ON_UPDATE_RETRY_TIMEOUT_IN_MS, LOGS, PREFIXES } from '../firestore.utils.constants';
import { FunctionLogger } from '../../logging/function-logger.class';
import { checkIfEventHasBeenProcessed, CheckIfEventHasBeenProcessedError, CheckIfEventHasBeenProcessedErrorCode } from '@repo/shared/utils';

jest.mock('@repo/shared/utils', () => ({
  ...jest.requireActual('@repo/shared/utils'),
  checkIfEventHasBeenProcessed: jest.fn(),
  maskFields: jest.fn().mockImplementation((data, _fields) => {
    return data;
  }),
}));
jest.mock('firebase-functions/v2/firestore');
jest.mock('../../logging/function-logger.class');

describe(collectionOnWriteFunctionWrapper.name, () => {
  const subCollectionDocumentId = 'id-2';
  const collectionDocumentId = 'id-1';
  const compoundDocumentId = `${collectionDocumentId}-${subCollectionDocumentId}`;
  const documentPath = `collection/${collectionDocumentId}/subCollection/${subCollectionDocumentId}`;
  const baseEventValues = {
    id: 'event-id',
    authType: 'admin',
    authId: 'user-id',
    eventId: 'event-id',
    params: { collectionDocumentId, documentId: subCollectionDocumentId },
    time: new Date().toISOString(),
  };
  const expectedContext = {
    authType: baseEventValues.authType,
    authId: baseEventValues.authId,
    eventId: baseEventValues.eventId,
    params: baseEventValues.params,
    time: baseEventValues.time
  };
  const mockLogger = { info: jest.fn(), error: jest.fn(), fatal: jest.fn(), warn: jest.fn(), startStep: jest.fn(), endStep: jest.fn() };

  beforeEach(() => {
    (onDocumentWrittenWithAuthContext as jest.Mock).mockImplementation((_path, handler) => handler);
    (FunctionLogger as jest.Mock).mockImplementation(() => mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when the document is created', () => {
    const documentData = {
      createdAt: { toDate: () => new Date() },
    };
    const documentSnapshot = {
      id: subCollectionDocumentId,
      data: () => documentData,
      ref: {
        firestore: {
          collection: jest.fn(),
        },
        update: jest.fn(),
        path: documentPath,
      },
    };

    const event = {
      ...baseEventValues,
      data: {
        before: null,
        after: documentSnapshot,
      },
    };
    it('should take into account the maskFields option when logging the event', async () => {
      const fn = collectionOnWriteFunctionWrapper({
        path: 'testCollection',
        maskFields: ['field1'],
      });
      const returnedDataFromMaskFields = {
        field1: 'xxxx',
      };
      (maskFields as jest.Mock).mockReturnValue(returnedDataFromMaskFields);
      await fn(event as any);
      expect(maskFields as jest.Mock).toHaveBeenCalledWith(documentData, ['field1']);
      expect(mockLogger.info).toHaveBeenCalledWith({
        id: LOGS.ON_CREATE.id,
        context: expectedContext,
        documentId: compoundDocumentId,
        documentData: returnedDataFromMaskFields,
      }, expect.any(String));
    });
    it('should just log the event when no onCreate handler is provided', async () => {
      const fn = collectionOnWriteFunctionWrapper({
        path: 'testCollection',
        handlers: {},
      });
      await fn(event as any);
      expect(mockLogger.info).toHaveBeenCalledWith({
        id: LOGS.ON_CREATE.id,
        context: expectedContext,
        documentId: compoundDocumentId,
        documentData: documentData,
      }, expect.any(String));
    });
    describe('when the event has been processed', () => {
      beforeEach(() => {
        (checkIfEventHasBeenProcessed as jest.Mock).mockResolvedValue({
          hasBeenProcessed: true,
          documentData: documentData,
        });
      });
      it('should log the event as already processed and not call the handler', async () => {
        const handler = jest.fn();
        const fn = collectionOnWriteFunctionWrapper({
          path: 'testCollection',
          handlers: {
            onCreate: {
              function: handler,
            },
          },
        });
        await fn(event as any);
        expect(mockLogger.info).toHaveBeenCalledWith({
          id: LOGS.ON_CREATE.id,
          context: expectedContext,
          documentId: compoundDocumentId,
          documentData: documentData,
        }, expect.any(String));
        expect(checkIfEventHasBeenProcessed).toHaveBeenCalledWith(documentSnapshot.ref.firestore, documentSnapshot.ref, PREFIXES.ON_CREATE, event.id, mockLogger, { maxRetries: undefined });
        expect(mockLogger.info).toHaveBeenCalledWith({
          id: LOGS.ON_CREATE_ALREADY_PROCESSED.id,
        }, expect.any(String));
        expect(handler).not.toHaveBeenCalled();
      });
    });
    describe('when the event has not been processed', () => {
      beforeEach(() => {
        (checkIfEventHasBeenProcessed as jest.Mock).mockResolvedValue({
          hasBeenProcessed: false,
          documentData: documentData,
        });
      });
      it('should call the handler', async () => {
        const handler = jest.fn();
        const fn = collectionOnWriteFunctionWrapper({
          path: 'testCollection',
          handlers: {
            onCreate: {
              function: handler,
            },
          },
        });
        await fn(event as any);
        expect(mockLogger.info).toHaveBeenCalledWith({
          id: LOGS.ON_CREATE.id,
          context: expectedContext,
          documentId: compoundDocumentId,
          documentData: documentData,
        }, expect.any(String));
        expect(checkIfEventHasBeenProcessed).toHaveBeenCalledWith(documentSnapshot.ref.firestore, documentSnapshot.ref, PREFIXES.ON_CREATE, event.id, mockLogger, { maxRetries: undefined });
        expect(handler).toHaveBeenCalledWith({
          context: expectedContext,
          documentData: {
            ...documentData,
            id: compoundDocumentId,
          },
          logger: mockLogger,
        });
      });
      describe('when max retries is reached', () => {
        beforeEach(() => {
          (checkIfEventHasBeenProcessed as jest.Mock).mockRejectedValue(new CheckIfEventHasBeenProcessedError({
            code: CheckIfEventHasBeenProcessedErrorCode.MAX_RETRIES_REACHED,
            message: 'Max retries reached',
          }));
        });
        it('should update the document with the max retries reached flag and throw an error', async () => {
          const handler = jest.fn();
          const fn = collectionOnWriteFunctionWrapper({
            path: 'testCollection',
            handlers: {
              onCreate: {
                function: handler,
              },
            },
          });
          (documentSnapshot.ref.update as jest.Mock).mockResolvedValue(undefined);
          try {
            await fn(event as any);
            expect(true).toBe(false);
          } catch (error: any) {
            expect(error).toBeInstanceOf(CheckIfEventHasBeenProcessedError);
            expect(error.code).toBe(CheckIfEventHasBeenProcessedErrorCode.MAX_RETRIES_REACHED);
          }
          expect(documentSnapshot.ref.update).toHaveBeenCalledWith({
            _onCreateMaxRetriesReached: true,
          });
          expect(handler).not.toHaveBeenCalled();
        });
        it('should log critical error log if the update fails', async () => {
          const handler = jest.fn();
          const fn = collectionOnWriteFunctionWrapper({
            path: 'testCollection',
            handlers: {
              onCreate: {
                function: handler,
              },
            },
          });
          (documentSnapshot.ref.update as jest.Mock).mockRejectedValue(new Error('Update failed'));
          try {
            await fn(event as any);
            expect(true).toBe(false);
          } catch (error: any) {
            expect(error).toBeInstanceOf(CheckIfEventHasBeenProcessedError);
            expect(error.code).toBe(CheckIfEventHasBeenProcessedErrorCode.MAX_RETRIES_REACHED);
          }
          expect(mockLogger.fatal).toHaveBeenCalledWith({
            id: LOGS.ON_CREATE_MAX_RETRIES_REACHED_UPDATE_ERROR.id,
            error: expect.any(String),
          }, expect.any(String));
        });
      });
    });
    it('should throw an error if there is an error when checking if the event has been processed', async () => {
      const handler = jest.fn();
      const fn = collectionOnWriteFunctionWrapper({
        path: 'testCollection',
        handlers: {
          onCreate: {
            function: handler,
          },
        },
      });
      const error = new Error('Unknown error');
      (checkIfEventHasBeenProcessed as jest.Mock).mockRejectedValue(error);
      try {
        await fn(event as any);
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBe(error);
      }
      expect(mockLogger.error).toHaveBeenCalledWith({
        id: LOGS.ON_CREATE_UNKNOWN_ERROR.id,
        error: expect.any(String),
      }, expect.any(String));
      expect(documentSnapshot.ref.update).toHaveBeenCalledWith({
        _onCreateEventId: null,
      });
      expect(handler).not.toHaveBeenCalled();
    });
    it('should log critical error log if the update fails', async () => {
      const handler = jest.fn();
      const fn = collectionOnWriteFunctionWrapper({
        path: 'testCollection',
        handlers: {
          onCreate: {
            function: handler,
          },
        },
      });
      (documentSnapshot.ref.update as jest.Mock).mockRejectedValue(new Error('Update failed'));
      try {
        await fn(event as any);
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBe(error);
      }
    });
    it('should throw an error if the handler throws an error', async () => {
      const handler = jest.fn().mockRejectedValue(new Error('Unknown error'));
      const fn = collectionOnWriteFunctionWrapper({
        path: 'testCollection',
        handlers: {
          onCreate: {
            function: handler,
          },
        },
      });
      (documentSnapshot.ref.update as jest.Mock).mockResolvedValue(undefined);
      try {
        await fn(event as any);
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBe(error);
        expect(mockLogger.error).toHaveBeenCalledWith({
          id: LOGS.ON_CREATE_UNKNOWN_ERROR.id,
          error: expect.any(String),
        }, expect.any(String));
      }
    });
  });
  describe('when the document is updated', () => {
    
    const now = new Date();
    const before = new Date(now.getTime() - 1000);
    const beforeDocumentData = {
      _onCreateEventId: baseEventValues.id,
      _onCreateRetries: 0,
      field1: 'value1',
      createdAt: { toDate: () => before },
      updatedAt: { toDate: () => before },
    };
    const afterDocumentData = {
      ...beforeDocumentData,
      field1: 'value2',
      updatedAt: { toDate: () => now },
    };
    const beforeDocumentSnapshot = {
      id: subCollectionDocumentId,
      data: () => beforeDocumentData,
      ref: {
        firestore: {
          collection: jest.fn(),
        },
        update: jest.fn(),
        path: documentPath,
      },
    };
    const afterDocumentSnapshot = {
      id: subCollectionDocumentId,
      data: () => afterDocumentData,
      ref: {
        firestore: {
          collection: jest.fn(),
        },
        update: jest.fn(),
        path: documentPath,
      },
    };
    const expectedBeforeDocumentData = {
      ...beforeDocumentData,
      id: compoundDocumentId,
    };
    const expectedAfterDocumentData = {
      ...afterDocumentData,
      id: compoundDocumentId,
    };
    const event = {
      ...baseEventValues,
      data: {
        before: beforeDocumentSnapshot,
        after: afterDocumentSnapshot,
      },
    };
    describe('when the update is to make on create run again', () => {
      const modifiedAfterDocumentData = {
        ...afterDocumentData,
        _onCreateEventId: undefined,
        _onCreateRetries: undefined,
      };
      const modifiedEvent = {
        ...event,
        data: {
          before: beforeDocumentSnapshot,
          after: {
            ...afterDocumentSnapshot,
            data: () => modifiedAfterDocumentData,
          },
        },
      };
      
      it('should call the on create handler', async () => {
        const handler = jest.fn();
        const fn = collectionOnWriteFunctionWrapper({
          path: 'testCollection',
          handlers: {
            onCreate: {
              function: handler,
            },
          },
        });
        const afterCheckDocumentData = {
          ...modifiedAfterDocumentData,
          _onCreateEventId: event.id,
          _onCreateRetries: 0,
        };
        (checkIfEventHasBeenProcessed as jest.Mock).mockResolvedValue({
          hasBeenProcessed: false,
          documentData: afterCheckDocumentData,
        });
        await fn(modifiedEvent as any);
        expect(handler).toHaveBeenCalledWith({
          context: expectedContext,
          documentData: {
            ...afterCheckDocumentData,
            id: compoundDocumentId,
          },
          logger: mockLogger,
        });
      });
    });
    describe('when the update is from a changing a field in the document', () => {
      it('should take into account the maskFields option when logging the event', async () => {
        const fn = collectionOnWriteFunctionWrapper({
          path: 'testCollection',
          maskFields: ['field1'],
        });
        await fn(event as any);
        expect(maskFields as jest.Mock).toHaveBeenCalledWith(expectedAfterDocumentData, ['field1']);
      });
      it('should not log a warning and call the on update handler if the updatedAt is valid', async () => {
        const handler = jest.fn();
        const fn = collectionOnWriteFunctionWrapper({
          path: 'testCollection',
          handlers: {
            onUpdate: {
              function: handler,
            },
          },
        });
        await fn(event as any);
        expect(mockLogger.info).toHaveBeenCalledWith({
          id: LOGS.ON_UPDATE.id,
          context: expectedContext,
          documentId: compoundDocumentId,
          afterDocumentData: expectedAfterDocumentData,
          beforeDocumentData: expectedBeforeDocumentData,
        }, expect.any(String));
        expect(mockLogger.warn).not.toHaveBeenCalled();
        expect(handler).toHaveBeenCalledWith({
          context: expectedContext, 
          afterData: expectedAfterDocumentData,
          beforeData: expectedBeforeDocumentData,
          logger: mockLogger,
        });
      });
      it('should log a warning and call the on update handler if the updatedAt is invalid', async () => {
        const handler = jest.fn();
        const fn = collectionOnWriteFunctionWrapper({
          path: 'testCollection',
          handlers: {
            onUpdate: {
              function: handler,
            },
          },
        });
        const modifiedAfterDocumentData = {
          ...afterDocumentData,
          updatedAt: beforeDocumentData.updatedAt,
        };
        const modifiedEvent = {
          ...event,
          data: {
            before: beforeDocumentSnapshot,
            after: {
              ...afterDocumentSnapshot,
              data: () => modifiedAfterDocumentData,
            },
          },
        };
        const expectedAfterDocumentData = {
          ...modifiedAfterDocumentData,
          id: compoundDocumentId,
        };
        await fn(modifiedEvent as any);
        expect(mockLogger.warn).toHaveBeenCalledWith({
          id: LOGS.ON_UPDATE_INVALID_UPDATED_AT.id,
        }, expect.any(String));
        expect(mockLogger.info).toHaveBeenCalledWith({
          id: LOGS.ON_UPDATE.id,
          context: expectedContext,
          documentId: compoundDocumentId,
          afterDocumentData: expectedAfterDocumentData,
          beforeDocumentData: expectedBeforeDocumentData,
        }, expect.any(String));
        expect(handler).toHaveBeenCalledWith({
          context: expectedContext, 
          afterData: expectedAfterDocumentData,
          beforeData: expectedBeforeDocumentData,
          logger: mockLogger,
        });
      });
      it('should log an error and not call the on update handler if the retry timeout is reached', async () => {
        const handler = jest.fn();
        const fn = collectionOnWriteFunctionWrapper({
          path: 'testCollection',
          handlers: {
            onUpdate: {
              function: handler,
            },
          },
        });
        const modifiedEvent = {
          ...event,
          time: new Date(now.getTime() - (DEFAULT_ON_UPDATE_RETRY_TIMEOUT_IN_MS + 1000)).toISOString(),
        };
        await fn(modifiedEvent as any);
        expect(mockLogger.fatal).toHaveBeenCalledWith({
          id: LOGS.ON_UPDATE_RETRY_TIMEOUT.id,
        }, expect.any(String));
        expect(handler).not.toHaveBeenCalled();
      });
      it('should take into account the retry timeout if it is provided', async () => {
        const handler = jest.fn();
        const retryTimeout = 1000;
        const fn = collectionOnWriteFunctionWrapper({
          path: 'testCollection',
          handlers: {
            onUpdate: {
              function: handler,
              options: {
                retryTimeout,
              },
            },
          },
        });
        const modifiedEvent = {
          ...event,
          time: new Date(now.getTime() - (retryTimeout + 1000)).toISOString(),
        };
        await fn(modifiedEvent as any);
        expect(mockLogger.fatal).toHaveBeenCalledWith({
          id: LOGS.ON_UPDATE_RETRY_TIMEOUT.id,
        }, expect.any(String));
        expect(handler).not.toHaveBeenCalled();
      });
    });
    describe('when the update is from the on create process', () => {
      it('should log and not call the on update handler', async () => {
        const modifiedBeforeDocumentData = {
          ...beforeDocumentData,
          _onCreateEventId: undefined,
          _onCreateRetries: undefined,
        };
        const modifiedBeforeDocumentSnapshot = {
          ...beforeDocumentSnapshot,
          data: () => modifiedBeforeDocumentData,
        };
        const modifiedEvent = {
          ...event,
          data: {
            before: modifiedBeforeDocumentSnapshot,
            after: afterDocumentSnapshot,
          },
        };
        const handler = jest.fn();
        const fn = collectionOnWriteFunctionWrapper({
          path: 'testCollection',
          handlers: {
            onUpdate: {
              function: handler,
            },
          },
        });
        await fn(modifiedEvent as any);
        expect(mockLogger.info).toHaveBeenCalledWith({
          id: LOGS.ON_UPDATE.id,
          context: expectedContext,
          documentId: compoundDocumentId,
          afterDocumentData: expectedAfterDocumentData,
          beforeDocumentData: {
            ...modifiedBeforeDocumentData,
            id: compoundDocumentId,
          },
        }, expect.any(String));
        expect(handler).not.toHaveBeenCalled();
      });
    });
  });
  describe('when the document is deleted', () => {
    const documentData = {
      someField: 'someValue',
      createdAt: { toDate: () => new Date() },
      updatedAt: { toDate: () => new Date() },
    };
    const documentSnapshot = {
      id: subCollectionDocumentId,
      data: () => documentData,
      ref: {
        firestore: {
          collection: jest.fn(),
        },
        update: jest.fn(),
        path: documentPath,
      },
    };
    const expectedDocumentData = {
      ...documentData,
      id: compoundDocumentId,
    };
    const event = {
      ...baseEventValues,
      data: {
        before: documentSnapshot,
        after: null,
      },
    };
    it('should log and call the on delete handler', async () => {
      const handler = jest.fn();
      const fn = collectionOnWriteFunctionWrapper({
        path: 'testCollection',
        handlers: {
          onDelete: {
            function: handler,
          },
        },
      });
      await fn(event as any);
      expect(mockLogger.info).toHaveBeenCalledWith({
        id: LOGS.ON_DELETE.id,
        context: expectedContext,
        documentId: compoundDocumentId,
      }, expect.any(String));
      expect(handler).toHaveBeenCalledWith({
        context: expectedContext,
        documentData: expectedDocumentData,
        logger: mockLogger,
      });
    });
  });
}); 