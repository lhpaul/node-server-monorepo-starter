import { FunctionLogger } from '../logging/function-logger.class';

export interface CollectionEventContext {
  authType: string;
  authId?: string;
  eventId: string;
  params: Record<string, string>;
  time: string;
}

export interface OnCreateHandlerConfig<DocumentModel> {
  function: OnCreateFunction<DocumentModel>;
  options?: {
    maskFields?: string[];
    maxRetries?: number;
  };
}
export interface OnDeleteHandlerConfig<DocumentModel> {
  function: OnDeleteFunction<DocumentModel>;
}
export interface OnUpdateHandlerConfig<DocumentModel> {
  function: OnUpdateFunction<DocumentModel>;
  options?: {
    maskFields?: string[];
    retryTimeout: number;
  };
}
export type OnCreateFunction<DocumentModel> = (returnValues: {
  context: CollectionEventContext;
  documentData: DocumentModel;
  logger: FunctionLogger;
}) => Promise<void>;
export type OnDeleteFunction<DocumentModel> = (returnValues: {
  context: CollectionEventContext;
  documentData: DocumentModel;
  logger: FunctionLogger;
}) => Promise<void>;
export type OnUpdateFunction<DocumentModel> = (returnValues: {
  afterData: DocumentModel;
  beforeData: DocumentModel;
  context: CollectionEventContext;
  logger: FunctionLogger;
}) => Promise<void>;