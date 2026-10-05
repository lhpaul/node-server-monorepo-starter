import { Example } from '../example.entity';

describe(Example.name, () => {
  const data = {
    createdAt: new Date(),
    description: 'test',
    id: '1',
    name: 'test',
    updatedAt: new Date(),
  };
  it('should create an instance with the correct data', () => {
    const entity = new Example(data);
    expect(entity).toBeInstanceOf(Example);
    expect(entity.createdAt).toBe(data.createdAt);
    expect(entity.description).toBe(data.description);
    expect(entity.id).toBe(data.id);
    expect(entity.name).toBe(data.name);
    expect(entity.updatedAt).toBe(data.updatedAt);
  });
});