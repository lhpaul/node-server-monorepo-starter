/**
 * Type definition for parent collection IDs in a nested collection structure.
 * Maps parent collection names to their corresponding document IDs.
 */
export type ParentIds = {[parentCollection: string]: string};

/**
 * Enum for order by direction.
 */
export enum OrderByDirection {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * Configuration options for document creation operations.
 */
export interface CreateDocumentConfig {
  /** Optional custom document ID. If not provided, Firestore will generate one */
  id?: string;
}

/**
 * Configuration options for document update operations.
 */
export interface UpdateDocumentConfig {
  /** If true, skips updating the timestamp field during updates */
  ignoreTimestamp?: boolean;
}

/**
 * Output type for preparing write operations to Firestore.
 */
export interface PrepareWriteOperationOutput {
  /** The Firestore document reference */
  documentRef: FirebaseFirestore.DocumentReference;
  /** The document data to be written */
  documentData: any;
}
