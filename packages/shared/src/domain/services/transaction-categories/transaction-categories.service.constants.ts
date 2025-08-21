export const ERRORS_MESSAGES = {
  INVALID_TRANSACTION_CATEGORY_TYPE: (transactionCategoryType: string | null | undefined, transactionCategoryId: string) => `Invalid transaction category type: ${transactionCategoryType} in document ${transactionCategoryId}`,
};