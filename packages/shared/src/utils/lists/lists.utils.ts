import { IQueryOptions } from '../../definitions/listing.interfaces';
import { ERROR_MESSAGES } from './lists.constants';
export function filterList<T, Y>(
  list: T[],
  field: string,
  query: IQueryOptions<Y>,
): T[] {
  return list.filter((item) => {
    const value = item[field as keyof T] as Y;
    if (query.operator === 'in' || query.operator === 'not-in') {
      if (!Array.isArray(query.value)) {
        throw new Error(ERROR_MESSAGES.QUERY_VALUE_MUST_BE_AN_ARRAY);
      }
      return query.operator === 'in'
        ? query.value.includes(value)
        : !query.value.includes(value);
    }
    return query.operator === '=='
      ? value === query.value
      : query.operator === '!='
        ? value !== query.value
        : query.operator === '>'
          ? value > query.value
          : query.operator === '>='
            ? value >= query.value
            : query.operator === '<'
              ? value < query.value
              : value <= query.value; // operator is "<=
  });
}
