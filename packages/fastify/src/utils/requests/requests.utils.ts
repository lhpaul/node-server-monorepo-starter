export function mapDateQueryParams(query: Record<string, string>, fields: string[]): Record<string, any> {
  return Object.entries(query).reduce((acc, [fullKey, value]) => {
    const key = fullKey.split('[')[0];
    if (fields.includes(key)) {
      acc[fullKey] = new Date(value);
    } else {
      acc[fullKey] = value;
    }
    return acc;
  }, {} as Record<string, any>);
}
