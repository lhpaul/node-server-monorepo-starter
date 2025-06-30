import {
  changeTimestampsToDate,
  changeTimestampsToDateISOString,
  checkIfEventHasBeenProcessed,
  CheckIfEventHasBeenProcessedError,
  CheckIfEventHasBeenProcessedErrorCode,
  maskFields,
  printError,
  removeDocumentMetadata,
} from '@repo/shared/utils';
import { ParamsOf } from 'firebase-functions';
import { Change } from 'firebase-functions/v1';
import { CloudFunction } from 'firebase-functions/v2';
import {
  DocumentSnapshot,
  FirestoreAuthEvent,
  onDocumentWrittenWithAuthContext,
} from 'firebase-functions/v2/firestore';
import { isEqual } from 'lodash';

import { FunctionLogger } from '../logging/function-logger.class';
import { DEFAULT_ON_UPDATE_RETRY_TIMEOUT_IN_MS, EVENT_LABELS, LOG_GROUP, LOGS, PREFIXES, STEPS } from './firestore.utils.constants';
import {
  CollectionEventContext,
  OnCreateHandlerConfig,
  OnDeleteHandlerConfig,
  OnUpdateHandlerConfig,
} from './firestore.utils.interfaces';


export function collectionOnWriteFunctionWrapper<DocumentModel>(options: {
  path: string;
  handlers?: {
    onCreate?: OnCreateHandlerConfig<DocumentModel>;
    onDelete?: OnDeleteHandlerConfig<DocumentModel>;
    onUpdate?: OnUpdateHandlerConfig<DocumentModel>;
  },
  maskFields?: string[];
  }): CloudFunction<FirestoreAuthEvent<Change<DocumentSnapshot> | undefined, ParamsOf<string>>> {
  return onDocumentWrittenWithAuthContext(`${options.path}/{documentId}`, async (event) => {
    const beforeSnapshot = event.data?.before ? event.data.before : null;
    const afterSnapshot = event.data?.after ? event.data.after : null;
    const eventName = beforeSnapshot ? afterSnapshot ? EVENT_LABELS.ON_UPDATE : EVENT_LABELS.ON_DELETE : EVENT_LABELS.ON_CREATE;
    const context: CollectionEventContext = {
      authType: event.authType,
      authId: event.authId,
      eventId: event.id,
      params: event.params,
      time: event.time
    };
    if (eventName === EVENT_LABELS.ON_CREATE) {
      await _onCreate(afterSnapshot as DocumentSnapshot, context, options.path, options.handlers?.onCreate, { maskFields: options.maskFields });
      return;
    }
    if (eventName === EVENT_LABELS.ON_UPDATE) {
      const documentData = afterSnapshot?.data() as any;
      /*
      * This is for when we need to run on create handler on an existing document.
      * The condition for this to happen is that the _onCreateEventId and _onCreateRetries fields are undefined.
      */
      if (options.handlers?.onCreate && documentData._onCreateEventId === undefined && documentData._onCreateRetries === undefined) {
        await _onCreate(afterSnapshot as DocumentSnapshot, context, options.path, options.handlers.onCreate, { maskFields: options.maskFields });
        return;
      }
      await _onUpdate(
        beforeSnapshot as DocumentSnapshot,
        afterSnapshot as DocumentSnapshot,
        context,
        options.path,
        options.handlers?.onUpdate,
        { maskFields: options.maskFields }
      );
      return;
    }
    await _onDelete(beforeSnapshot as DocumentSnapshot, context, options.path, options.handlers?.onDelete);
    return;
  });
}

async function _onCreate<DocumentModel>(newDocumentSnap: FirebaseFirestore.DocumentSnapshot, context: CollectionEventContext, documentLabel: string, handlerConfig?: OnCreateHandlerConfig<DocumentModel>, collectionConfig?: { maskFields?: string[] }): Promise<void> {
  const compoundDocumentId = _getCompoundId(newDocumentSnap);
  const documentData = newDocumentSnap.data();
  const logger = new FunctionLogger();
  const logGroup = `${LOG_GROUP}.${_onCreate.name}`;
  logger.info({
    id: LOGS.ON_CREATE.id,
    context,
    documentId: compoundDocumentId,
    documentData: collectionConfig?.maskFields ? maskFields(changeTimestampsToDateISOString(documentData), collectionConfig.maskFields) : changeTimestampsToDateISOString(documentData),
  }, LOGS.ON_CREATE.message(documentLabel, compoundDocumentId));
  if (handlerConfig) {
    try {
      logger.startStep(STEPS.INITIAL_TRANSACTION.id, logGroup);
      const db = newDocumentSnap.ref.firestore;
      const result = await checkIfEventHasBeenProcessed(db, newDocumentSnap.ref, PREFIXES.ON_CREATE, context.eventId, logger, { maxRetries: handlerConfig.options?.maxRetries });
      if (result.hasBeenProcessed) {
        logger.info({
          id: LOGS.ON_CREATE_ALREADY_PROCESSED.id,
        }, LOGS.ON_CREATE_ALREADY_PROCESSED.message(documentLabel, compoundDocumentId));
        return;
      }
      await handlerConfig.function({ context, documentData: { ...changeTimestampsToDate(result.documentData), id: compoundDocumentId }, logger });
    } catch (error) {
      if (error instanceof CheckIfEventHasBeenProcessedError && error.code === CheckIfEventHasBeenProcessedErrorCode.MAX_RETRIES_REACHED) {
        logger.error({
          id: LOGS.ON_CREATE_MAX_RETRIES_REACHED.id,
        }, LOGS.ON_CREATE_MAX_RETRIES_REACHED.message(documentLabel, compoundDocumentId));
        await newDocumentSnap.ref.update({
          _onCreateMaxRetriesReached: true
        }).catch((updateError) => {
          logger.error({
            id: LOGS.ON_CREATE_MAX_RETRIES_REACHED_UPDATE_ERROR.id,
            error: printError(updateError)
          }, LOGS.ON_CREATE_MAX_RETRIES_REACHED_UPDATE_ERROR.message(documentLabel, compoundDocumentId, updateError));
          throw(error);
        });
        throw error;
      }
      logger.error({
        id: LOGS.ON_CREATE_UNKNOWN_ERROR.id,
        error: printError(error)
      }, LOGS.ON_CREATE_UNKNOWN_ERROR.message(documentLabel, compoundDocumentId));
      await newDocumentSnap.ref.update({
        _onCreateEventId: null
      }).catch((updateError) => {
        logger.error({
          id: LOGS.ON_CREATE_UNKNOWN_ERROR_UPDATE_ERROR.id,
          error: printError(updateError)
        }, LOGS.ON_CREATE_UNKNOWN_ERROR_UPDATE_ERROR.message(documentLabel, compoundDocumentId, updateError));
        throw error;
      });
      throw error;
    }
  }
}

async function _onDelete<DocumentModel>(documentSnap: FirebaseFirestore.DocumentSnapshot, context: CollectionEventContext, documentLabel: string, config?: OnDeleteHandlerConfig<DocumentModel>): Promise<void> {
  const compoundDocumentId = _getCompoundId(documentSnap);
  const documentData = documentSnap.data() as any;
  const logger = new FunctionLogger();
  logger.info({
    id: LOGS.ON_DELETE.id,
    context,
    documentId: compoundDocumentId
  }, LOGS.ON_DELETE.message(documentLabel, compoundDocumentId));
  if (config?.function) {
    await config.function({ documentData: { ...documentData, id: compoundDocumentId }, context, logger })
  }
}

async function _onUpdate<DocumentModel>(beforeDocumentSnap: FirebaseFirestore.DocumentSnapshot, afterDocumentSnap: FirebaseFirestore.DocumentSnapshot, context: CollectionEventContext, documentLabel: string, handlerConfig?: OnUpdateHandlerConfig<DocumentModel>, collectionConfig?: { maskFields?: string[] }): Promise<void> {
  const compoundDocumentId = _getCompoundId(afterDocumentSnap);
  const beforeData = { ...beforeDocumentSnap.data(), id: compoundDocumentId } as any;
  const afterData = { ...afterDocumentSnap.data(), id: compoundDocumentId } as any;
  const logger = new FunctionLogger();
  logger.info({
    id: LOGS.ON_UPDATE.id,
    context,
    documentId: compoundDocumentId,
    afterDocumentData: collectionConfig?.maskFields ? maskFields(changeTimestampsToDateISOString(afterData), collectionConfig.maskFields) : changeTimestampsToDateISOString(afterData),
    beforeDocumentData: collectionConfig?.maskFields ? maskFields(changeTimestampsToDateISOString(beforeData), collectionConfig.maskFields) : changeTimestampsToDateISOString(beforeData),
  }, LOGS.ON_UPDATE.message(documentLabel, compoundDocumentId));
  const beforeUpdatedAt = beforeData.updatedAt.toDate();
  const afterUpdatedAt = afterData.updatedAt.toDate();
  const updatedAtChanged = beforeUpdatedAt.getTime() !== afterUpdatedAt.getTime();
  const updatedAtValid = updatedAtChanged && beforeUpdatedAt < afterUpdatedAt;
  if (!updatedAtValid && !isEqual(removeDocumentMetadata(beforeData), removeDocumentMetadata(afterData))) {
    logger.warn({
      id: LOGS.ON_UPDATE_INVALID_UPDATED_AT.id,
    }, LOGS.ON_UPDATE_INVALID_UPDATED_AT.message(documentLabel, compoundDocumentId));
  }
  if (handlerConfig && !_isOnCreateUpdate(beforeData, afterData)) {
    // this is so avoid infinite retries
    const retryTimeout = handlerConfig.options?.retryTimeout || DEFAULT_ON_UPDATE_RETRY_TIMEOUT_IN_MS;
    const eventAgeMs = Date.now() - Date.parse(context.time);
    if (eventAgeMs > retryTimeout) {
      logger.error({
        id: LOGS.ON_UPDATE_RETRY_TIMEOUT.id,
      }, LOGS.ON_UPDATE_RETRY_TIMEOUT.message(documentLabel, compoundDocumentId));
      return;
    }
    await handlerConfig.function({ afterData: changeTimestampsToDate(afterData), beforeData: changeTimestampsToDate(beforeData), context, logger });
  }
}

// This method is to identify if the update was for an onCreate event
function _isOnCreateUpdate(beforeData: any, afterData: any): boolean {
  return (!beforeData._onCreateEventId && afterData._onCreateEventId) as boolean;
}

function _getCompoundId(documentSnap: FirebaseFirestore.DocumentSnapshot): string {
  let compoundId = '';
  const splitPath = documentSnap.ref.path.split('/');
  splitPath.forEach((path, index) => {
    if (index % 2 !== 0) {
      compoundId += path;
      if (index < splitPath.length - 1) {
        compoundId += '-';
      }
    }
  });
  return compoundId;
}
