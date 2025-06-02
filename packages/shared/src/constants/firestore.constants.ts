export enum FIRESTORE_ERROR_CODE {
  INTERNAL = 13, // "INTERNAL: Received RST_STREAM with code 2"
  UNAVAILABLE = 14, // "UNAVAILABLE: The service is temporarily unavailable."
  TOO_MUCH_CONTENTION = 10, // "ABORTED: Too much contention on these documents. Please try again." (concurrency error)
  NOT_FOUND = 5, // NOT_FOUND: No document to update
  ALREADY_EXISTS = 6, // "ALREADY_EXISTS: Document already exists"
}