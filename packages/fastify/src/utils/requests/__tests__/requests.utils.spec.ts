import { mapDateQueryParams } from '../requests.utils';

describe(mapDateQueryParams.name, () => {
  it('should convert date string values to Date objects for specified fields', () => {
    const query = {
      createdAt: '2024-03-20T10:00:00Z',
      name: 'John',
      updatedAt: '2024-03-21T15:30:00Z'
    };
    const fields = ['createdAt', 'updatedAt'];

    const result = mapDateQueryParams(query, fields);

    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(result.createdAt.getTime()).toBe(new Date(query.createdAt).getTime());
    expect(result.updatedAt.getTime()).toBe(new Date(query.updatedAt).getTime());
    expect(result.name).toBe(query.name);
  });

  it('should handle fields with date operators', () => {
    const query = {
      'createdAt[gte]': '2024-03-20T10:00:00Z',
      'createdAt[lte]': '2024-03-21T10:00:00Z',
      name: 'John'
    };
    const fields = ['createdAt'];

    const result = mapDateQueryParams(query, fields);

    expect(result['createdAt[gte]']).toBeInstanceOf(Date);
    expect(result['createdAt[lte]']).toBeInstanceOf(Date);
    expect(result['createdAt[gte]'].getTime()).toBe(new Date(query['createdAt[gte]']).getTime());
    expect(result['createdAt[lte]'].getTime()).toBe(new Date(query['createdAt[lte]']).getTime());
    expect(result.name).toBe(query.name);
  });

  it('should return unmodified object when no matching fields are found', () => {
    const query = {
      name: 'John',
      age: '30'
    };
    const fields = ['createdAt', 'updatedAt'];

    const result = mapDateQueryParams(query, fields);

    expect(result).toEqual(query);
  });

  it('should handle empty query object', () => {
    const query = {};
    const fields = ['createdAt', 'updatedAt'];

    const result = mapDateQueryParams(query, fields);

    expect(result).toEqual(query);
  });

  it('should handle empty fields array', () => {
    const query = {
      createdAt: '2024-03-20T10:00:00Z',
      name: 'John'
    };
    const fields: string[] = [];

    const result = mapDateQueryParams(query, fields);

    expect(result).toEqual(query);
  });
});
