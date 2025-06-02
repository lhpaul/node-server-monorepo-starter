export const ERROR_MESSAGES = {
  INVALID_COLLECTION_PATH: (collectionPath: string) => `Invalid collection path: ${collectionPath}. Parent ID labels must start with ":"`,
  PARENT_ID_REQUIRED: (parentIdLabel: string, collectionPath: string) => `${parentIdLabel} parameter must be submitted since ${collectionPath} is a sub-collection`,
  PARENT_IDS_REQUIRED: (collectionPath: string) => `parentIds parameter must be submitted since ${collectionPath} is a sub-collection`,
  PARENT_DOCUMENT_NOT_FOUND: (parentDocumentRef: string) => `Parent document not found: ${parentDocumentRef}`,
};

export const STEPS = {
  CREATE_DOCUMENT: {
    id: 'create-document',
    message: 'Document created',
  },
  DELETE_DOCUMENT: {
    id: 'delete-document',
    message: 'Document deleted',
  },
  GET_DOCUMENT: {
    id: 'get-document',
    message: 'Document retrieved',
  },
  GET_DOCUMENTS: {
    id: 'get-documents',
    message: 'Documents retrieved',
  },
  UPDATE_DOCUMENT: {
    id: 'update-document',
    message: 'Document updated',
  },
};