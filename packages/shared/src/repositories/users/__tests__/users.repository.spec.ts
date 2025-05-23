import { QueryOptions } from '../../../definitions/listing.interfaces';
import { UsersRepository } from '../users.repository';
import { MOCK_USERS } from '../users.repository.constants';
import {
  UpdateUserError,
  UpdateUserErrorCode,
  DeleteUserError,
  DeleteUserErrorCode,
} from '../users.repository.errors';
import { GetUsersQuery } from '../users.repository.interfaces';

describe(UsersRepository.name, () => {
  let repository: UsersRepository;
  const createUserData = {
    email: 'newuser@example.com',
    currentPasswordHash: 'hashed_password_new',
  };

  beforeEach(() => {
    // Reset the singleton instance
    (UsersRepository as any).instance = undefined;
    repository = UsersRepository.getInstance();
  });

  describe(UsersRepository.getInstance.name, () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = UsersRepository.getInstance();
      const instance2 = UsersRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe(UsersRepository.prototype.createUser.name, () => {
    it('should create a new user and return its id', async () => {
      const result = await repository.createUser(createUserData);

      expect(result).toHaveProperty('id');
    });
  });

  describe(UsersRepository.prototype.getUserById.name, () => {
    it('should return a user when it exists', async () => {
      const user = MOCK_USERS[0];
      const fetchedUser = await repository.getUserById(user.id);
      expect(fetchedUser).toEqual(user);
    });

    it('should return null when user does not exist', async () => {
      const fetchedUser = await repository.getUserById('999');
      expect(fetchedUser).toBeNull();
    });
  });

  describe(UsersRepository.prototype.getUsers.name, () => {
    it('should return all users when no query is provided', async () => {
      const users = await repository.getUsers();
      expect(users).toEqual(MOCK_USERS);
    });

    it('should filter users by email', async () => {
      const query: GetUsersQuery = {
        email: [{ operator: '==', value: MOCK_USERS[0].email } as QueryOptions<string>],
      };
      const users = await repository.getUsers(query);
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe(MOCK_USERS[0].email);
    });
  });

  describe(UsersRepository.prototype.updateUser.name, () => {
    it('should update user fields', async () => {
      const user = MOCK_USERS[0];
      const updateData = {
        email: 'updated@example.com',
      };

      await repository.updateUser(user.id, updateData);
      const updatedUser = await repository.getUserById(user.id);

      expect(updatedUser?.email).toBe(updateData.email);
      expect(updatedUser?.currentPasswordHash).toBe(user.currentPasswordHash);
    });

    it('should throw error when user does not exist', async () => {
      const updateData = {
        email: 'updated@example.com',
      };
      try {
        await repository.updateUser('999', updateData);
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeInstanceOf(UpdateUserError);
        expect(error.code).toBe(UpdateUserErrorCode.NOT_FOUND);
      }
    });
  });

  describe(UsersRepository.prototype.deleteUser.name, () => {
    it('should delete user when it exists', async () => {
      const user = MOCK_USERS[0];
      await repository.deleteUser(user.id);
      const deletedUser = await repository.getUserById(user.id);
      expect(deletedUser).toBeNull();
    });

    it('should throw error when user does not exist', async () => {
      try {
        await repository.deleteUser('999');
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeInstanceOf(DeleteUserError);
        expect(error.code).toBe(DeleteUserErrorCode.NOT_FOUND);
      }
    });
  });
}); 