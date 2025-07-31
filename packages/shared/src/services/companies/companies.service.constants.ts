export const ADD_FINANCIAL_INSTITUTION_ERRORS_MESSAGES = {
  INVALID_CREDENTIALS_FORMAT: 'Invalid credentials format. It should be a JSON object.',
  RELATION_ALREADY_EXISTS: 'A financial institution relation already exists for this company and financial institution.',
};

export const ADD_FINANCIAL_INSTITUTION_STEPS = {
  CHECK_EXISTING_RELATION: 'check-existing-relation',
  CREATE_RELATION: 'create-relation',
  ENCRYPT_CREDENTIALS: 'encrypt-credentials',
};

export const LIST_FINANCIAL_INSTITUTIONS_STEPS = {
  GET_FINANCIAL_INSTITUTIONS: 'get-financial-institutions',
  GET_RELATIONS: 'get-relations',
};

export const REMOVE_FINANCIAL_INSTITUTION_ERRORS_MESSAGES = {
  RELATION_NOT_FOUND: 'Financial institution relation not found for the specified company and financial institution.',
};

export const REMOVE_FINANCIAL_INSTITUTION_STEPS = {
  DELETE_RELATION: 'delete-relation',
  FIND_RELATION: 'find-relation',
};

export const UPDATE_FINANCIAL_INSTITUTION_ERRORS_MESSAGES = {
  INVALID_CREDENTIALS_FORMAT: 'Invalid credentials format. It should be a JSON object.',
  RELATION_NOT_FOUND: 'Financial institution relation not found for the specified company and financial institution.',
};

export const UPDATE_FINANCIAL_INSTITUTION_STEPS = {
  FIND_RELATION: 'find-relation',
  ENCRYPT_CREDENTIALS: 'encrypt-credentials',
  UPDATE_RELATION: 'update-relation',
};