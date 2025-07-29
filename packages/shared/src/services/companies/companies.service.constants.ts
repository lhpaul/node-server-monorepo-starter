export const ADD_FINANCIAL_INSTITUTION_STEPS = {
  ENCRYPT_CREDENTIALS: 'encrypt-credentials',
  CHECK_EXISTING_RELATION: 'check-existing-relation',
  CREATE_RELATION: 'create-relation',
};

export const ADD_FINANCIAL_INSTITUTION_ERRORS_MESSAGES = {
  INVALID_CREDENTIALS_FORMAT: 'Invalid credentials format. It should be a JSON object.',
  RELATION_ALREADY_EXISTS: 'A financial institution relation already exists for this company and financial institution.',
};

export const REMOVE_FINANCIAL_INSTITUTION_STEPS = {
  FIND_RELATION: 'find-relation',
  DELETE_RELATION: 'delete-relation',
};

export const REMOVE_FINANCIAL_INSTITUTION_ERRORS_MESSAGES = {
  RELATION_NOT_FOUND: 'Financial institution relation not found for the specified company and financial institution.',
};