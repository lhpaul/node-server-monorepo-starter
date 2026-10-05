import { User, UserRole } from '../user.entity';

describe(User.name, () => {
  const data = {
    createdAt: new Date(),
    email: 'test@test.com',
    id: '1',
    role: UserRole.ADMIN,
    updatedAt: new Date(),
  };
  it('should create an instance with the correct data', () => {
    const entity = new User(data);
    expect(entity).toBeInstanceOf(User);
    expect(entity.createdAt).toBe(data.createdAt);
    expect(entity.email).toBe(data.email);
    expect(entity.id).toBe(data.id);
    expect(entity.role).toBe(data.role);
    expect(entity.updatedAt).toBe(data.updatedAt);
  });
});