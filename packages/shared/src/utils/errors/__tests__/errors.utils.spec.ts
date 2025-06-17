import stringify from 'json-stringify-safe';
import { printError } from '../errors.utils';

describe(printError.name, () => {
  it('should return the string if error is a string', () => {
    expect(printError('simple error')).toBe('simple error');
  });

  it('should return error.message if error has stack and message is a string', () => {
    const error = { stack: 'stack', message: 'error message' };
    expect(printError(error)).toBe('error message');
  });

  it('should stringify the error if it is an object without stack/message/toString', () => {
    const errorObj = { foo: 'bar' };
    expect(printError(errorObj)).toBe(stringify(errorObj));
  });

  it('should return error as string if it is a primitive (number)', () => {
    const error = 42;
    expect(printError(error)).toBe(error);
  });
}); 