/**
 * A custom error class that extends the built-in Error class with additional properties.
 * This class is designed to handle known error cases with specific error codes and optional data.
 * 
 * @template ErrorCode - A string literal type that represents the specific error code
 */
export class KnownError<ErrorCode extends string> extends Error {
  /** The specific error code associated with this error */
  code: ErrorCode;
  
  /** Optional additional data associated with this error */
  data?: any;

  /**
   * Creates a new instance of KnownError
   * 
   * @param input - The input object containing error details
   * @param input.code - The specific error code for this error
   * @param input.message - Optional error message. If not provided, the error code will be used
   * @param input.data - Optional additional data associated with this error
   */
  constructor(input: {
    code: ErrorCode;
    message?: string;
    data?: any;
  }) {
    super(input.message);
    this.code = input.code;
    this.data = input.data;
  }
}
