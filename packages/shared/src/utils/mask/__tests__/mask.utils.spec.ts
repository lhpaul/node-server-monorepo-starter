import { maskString, maskFields } from '../mask.utils';

describe(maskString.name, () => {
  it('should mask the full string by default', () => {
    const result = maskString('1234567890');
    expect(result).toBe('**********');
  });

  it('should mask the entire string if its length is less than or equal to the mask length', () => {
    const result = maskString('123', { maskLength: 4 });
    expect(result).toBe('***');
  });

  it('should use the specified mask character and length', () => {
    const result = maskString('1234567890', { maskChar: '#', maskLength: 6 });
    expect(result).toBe('123456####');
  });

  it('should handle an empty string gracefully', () => {
    const result = maskString('');
    expect(result).toBe('');
  });

  it('should handle custom mask length greater than the string length', () => {
    const result = maskString('123', { maskLength: 5 });
    expect(result).toBe('***');
  });
});

describe(maskFields.name, () => {
  it('should return the original object if input object is not an object', () => {
    const input = 'not an object';
    const result = maskFields(input, ['email']);
    expect(result).toBe(input);
  });
  it('should return the original object if input object is null', () => {
    const input = null;
    const result = maskFields(input, ['email']);
    expect(result).toBe(input);
  });
  it('should mask specified fields in an object', () => {
    const input = { name: 'John Doe', email: 'john.doe@example.com' };
    const result = maskFields(input, ['email']);
    expect(result).toEqual({
      name: 'John Doe',
      email: '********************',
    });
  });

  it('should not modify fields not listed in fieldsToMask', () => {
    const input = { name: 'John Doe', email: 'john.doe@example.com' };
    const result = maskFields(input, ['email']);
    expect(result.name).toBe('John Doe');
  });

  it('should handle missing fields gracefully', () => {
    const input = { name: 'John Doe' };
    const result = maskFields(input, ['email']);
    expect(result).toEqual({ name: 'John Doe' });
  });

  it('should use the specified mask character and length', () => {
    const input = { name: 'John Doe', email: 'john.doe@example.com' };
    const result = maskFields(input, ['email'], {
      maskChar: '#',
      maskLength: 6,
    });
    expect(result).toEqual({
      name: 'John Doe',
      email: 'john.d##############',
    });
  });

  it('should not mutate the original object', () => {
    const input = { name: 'John Doe', email: 'john.doe@example.com' };
    const result = maskFields(input, ['email']);
    expect(input).toEqual({ name: 'John Doe', email: 'john.doe@example.com' });
    expect(result).not.toBe(input);
  });
});
