export const MAX_WRITE_BATCH_SIZE = 500; // we limit the batch size to 500 writes to avoid errors
export const WRITES_PER_CREATE_DOCUMENT = 3; // creating documents takes 3 writes since each server timestamp is a write (used for the createdAt and updatedAt fields)
export const WRITES_PER_UPDATE_DOCUMENT = 2; // updating documents takes 2 writes since each server timestamp is a write (used for the updatedAt field)
export const WRITES_PER_DELETE_DOCUMENT = 1; // deleting documents takes 1 write