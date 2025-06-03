import { filterList } from '../lists.utils';
import { QueryItem } from '../../../definitions/listing.interfaces';
import { ERROR_MESSAGES } from '../lists.constants';

describe(filterList.name, () => {
  describe('numeric comparisons', () => {
    const fieldName = 'number';
    const items = [
      { [fieldName]: 1 },
      { [fieldName]: 2 },
      { [fieldName]: 3 },
      { [fieldName]: 4 },
      { [fieldName]: 5 },
    ];

    it('should filter using equals operator', () => {
      const query: QueryItem<number> = { operator: '==', value: 3 };
      expect(filterList(items, fieldName, query)).toEqual([items[2]]);
    });

    it('should filter using not equals operator', () => {
      const query: QueryItem<number> = { operator: '!=', value: 3 };
      expect(filterList(items, fieldName, query)).toEqual([
        items[0],
        items[1],
        items[3],
        items[4],
      ]);
    });

    it('should filter using greater than operator', () => {
      const query: QueryItem<number> = { operator: '>', value: 3 };
      expect(filterList(items, fieldName, query)).toEqual([items[3], items[4]]);
    });

    it('should filter using greater than or equal operator', () => {
      const query: QueryItem<number> = { operator: '>=', value: 3 };
      expect(filterList(items, fieldName, query)).toEqual([
        items[2],
        items[3],
        items[4],
      ]);
    });

    it('should filter using less than operator', () => {
      const query: QueryItem<number> = { operator: '<', value: 3 };
      expect(filterList(items, fieldName, query)).toEqual([items[0], items[1]]);
    });

    it('should filter using less than or equal operator', () => {
      const query: QueryItem<number> = { operator: '<=', value: 3 };
      expect(filterList(items, fieldName, query)).toEqual([
        items[0],
        items[1],
        items[2],
      ]);
    });
  });

  describe('string comparisons', () => {
    const fieldName = 'string';
    const items = [
      { [fieldName]: 'apple' },
      { [fieldName]: 'banana' },
      { [fieldName]: 'cherry' },
      { [fieldName]: 'date' },
    ];

    it('should filter strings using equals operator', () => {
      const query: QueryItem<string> = { operator: '==', value: 'banana' };
      expect(filterList(items, fieldName, query)).toEqual([items[1]]);
    });

    it('should filter strings using not equals operator', () => {
      const query: QueryItem<string> = { operator: '!=', value: 'banana' };
      expect(filterList(items, fieldName, query)).toEqual([
        items[0],
        items[2],
        items[3],
      ]);
    });
  });

  describe('array operators', () => {
    const fieldName = 'number';
    const items = [
      { [fieldName]: 1 },
      { [fieldName]: 2 },
      { [fieldName]: 3 },
      { [fieldName]: 4 },
      { [fieldName]: 5 },
    ];
    it('should filter using in operator', () => {
      const query: QueryItem<number> = { operator: 'in', value: [2, 4] };
      expect(filterList(items, fieldName, query)).toEqual([items[1], items[3]]);
    });

    it('should filter using not-in operator', () => {
      const query: QueryItem<number> = { operator: 'not-in', value: [2, 4] };
      expect(filterList(items, fieldName, query)).toEqual([
        items[0],
        items[2],
        items[4],
      ]);
    });

    it('should throw error when in operator value is not an array', () => {
      const query: QueryItem<number> = { operator: 'in', value: 2 as any };
      expect(() => filterList(items, fieldName, query)).toThrow(
        ERROR_MESSAGES.QUERY_VALUE_MUST_BE_AN_ARRAY,
      );
    });

    it('should throw error when not-in operator value is not an array', () => {
      const query: QueryItem<number> = {
        operator: 'not-in',
        value: 2 as any,
      };
      expect(() => filterList(items, fieldName, query)).toThrow(
        ERROR_MESSAGES.QUERY_VALUE_MUST_BE_AN_ARRAY,
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty array', () => {
      const query: QueryItem<number> = { operator: '==', value: 1 };
      expect(filterList([], 'some-field', query)).toEqual([]);
    });

    it('should handle array with duplicate values', () => {
      const fieldName = 'number';
      const items = [
        { [fieldName]: 1 },
        { [fieldName]: 2 },
        { [fieldName]: 2 },
        { [fieldName]: 3 },
        { [fieldName]: 3 },
        { [fieldName]: 3 },
      ];
      const query: QueryItem<number> = { operator: '==', value: 2 };
      expect(filterList(items, fieldName, query)).toEqual([items[1], items[1]]);
    });
  });
});
