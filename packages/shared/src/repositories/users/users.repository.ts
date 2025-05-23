import { ExecutionContext } from '../../definitions';
import { QueryOptions } from '../../definitions/listing.interfaces';
import { User } from '../../domain/models/user.model';
import { filterList } from '../../utils';
import {
  ERROR_MESSAGES,
  MOCK_USERS,
} from './users.repository.constants';
import {
  UpdateUserError,
  UpdateUserErrorCode,
  DeleteUserError,
  DeleteUserErrorCode,
} from './users.repository.errors';
import {
  CreateUserBody,
  GetUsersQuery,
  UpdateUserBody,
} from './users.repository.interfaces';

export class UsersRepository {
  private static instance: UsersRepository;

  public static getInstance(): UsersRepository {
    if (!UsersRepository.instance) {
      UsersRepository.instance = new UsersRepository();
    }
    return UsersRepository.instance;
  }

  private constructor() {}

  public createUser(
    body: CreateUserBody,
    _context?: ExecutionContext,
  ): Promise<{ id: string }> {
    const id = MOCK_USERS.length.toString();
    MOCK_USERS.push(
      new User({
        ...body,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    return Promise.resolve({ id });
  }

  public deleteUser(id: string, _context?: ExecutionContext): Promise<void> {
    const index = MOCK_USERS.findIndex((u) => u.id === id);
    if (index !== -1) {
      MOCK_USERS.splice(index, 1);
    } else {
      throw new DeleteUserError({
        code: DeleteUserErrorCode.NOT_FOUND,
        message: ERROR_MESSAGES[DeleteUserErrorCode.NOT_FOUND],
      });
    }
    return Promise.resolve();
  }

  public getUserById(
    id: string,
    _context?: ExecutionContext,
  ): Promise<User | null> {
    return Promise.resolve(
      MOCK_USERS.find((user) => user.id === id) ?? null,
    );
  }

  public getUsers(
    query?: GetUsersQuery,
    _context?: ExecutionContext,
  ): Promise<User[]> {
    if (!query) {
      return Promise.resolve(MOCK_USERS);
    }
    let filteredItems: User[] = [...MOCK_USERS];
    for (const key in query) {
      const queries = query[
        key as keyof GetUsersQuery
      ] as QueryOptions<any>[];
      filteredItems = queries.reduce(
        (acc, query) => filterList(acc, key, query),
        filteredItems,
      );
    }
    return Promise.resolve(filteredItems);
  }

  public updateUser(
    id: string,
    body: UpdateUserBody,
    _context?: ExecutionContext,
  ): Promise<void> {
    const index = MOCK_USERS.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new UpdateUserError({
        code: UpdateUserErrorCode.NOT_FOUND,
        message: ERROR_MESSAGES[UpdateUserErrorCode.NOT_FOUND],
      });
    }

    const existingUser = MOCK_USERS[index];
    MOCK_USERS[index] = new User({
      ...existingUser,
      ...body,
      updatedAt: new Date(),
    });

    return Promise.resolve();
  }
} 