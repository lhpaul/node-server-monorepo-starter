import { User } from '../user.model';

describe(User.name, () => {
  const initialValues = {
    createdAt: new Date(),
    email: 'test@example.com',
    id: 'user-123',
    updatedAt: new Date(),
  };
  let user: User;

  beforeEach(() => {
    user = new User(initialValues);
  });

  describe('Initialization', () => {
    it('should create a new user instance', () => {
      expect(user).toBeInstanceOf(User);
    });

    it('should initialize with correct values', () => {
      expect(user.createdAt).toBe(initialValues.createdAt);
      expect(user.email).toBe(initialValues.email);
      expect(user.id).toBe(initialValues.id);
      expect(user.updatedAt).toBe(initialValues.updatedAt);
    });
  });
});
