import { ExecutionContext } from '../../definitions';
import { QueryOptions } from '../../definitions/listing.interfaces';
import { UserCompanyRelation } from '../../domain/models/user-company-relation.model';
import { filterList } from '../../utils';
import {
  ERROR_MESSAGES,
  MOCK_USER_COMPANY_RELATIONS,
} from './user-company-relations.repository.constants';
import {
  UpdateUserCompanyRelationError,
  UpdateUserCompanyRelationErrorCode,
  DeleteUserCompanyRelationError,
  DeleteUserCompanyRelationErrorCode,
} from './user-company-relations.repository.errors';
import {
  CreateUserCompanyRelationBody,
  GetUserCompanyRelationsQuery,
  UpdateUserCompanyRelationBody,
} from './user-company-relations.repository.interfaces';

export class UserCompanyRelationsRepository {
  private static instance: UserCompanyRelationsRepository;

  public static getInstance(): UserCompanyRelationsRepository {
    if (!UserCompanyRelationsRepository.instance) {
      UserCompanyRelationsRepository.instance = new UserCompanyRelationsRepository();
    }
    return UserCompanyRelationsRepository.instance;
  }

  private constructor() {}

  public createUserCompanyRelation(
    body: CreateUserCompanyRelationBody,
    _context?: ExecutionContext,
  ): Promise<{ id: string }> {
    const id = MOCK_USER_COMPANY_RELATIONS.length.toString();
    MOCK_USER_COMPANY_RELATIONS.push(
      new UserCompanyRelation({
        ...body,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    return Promise.resolve({ id });
  }

  public getUserCompanyRelationById(
    id: string,
    _context?: ExecutionContext,
  ): Promise<UserCompanyRelation | null> {
    return Promise.resolve(
      MOCK_USER_COMPANY_RELATIONS.find((relation) => relation.id === id) ?? null,
    );
  }

  public getUserCompanyRelations(
    query?: GetUserCompanyRelationsQuery,
    _context?: ExecutionContext,
  ): Promise<UserCompanyRelation[]> {
    if (!query) {
      return Promise.resolve(MOCK_USER_COMPANY_RELATIONS);
    }
    let filteredItems: UserCompanyRelation[] = [...MOCK_USER_COMPANY_RELATIONS];
    for (const key in query) {
      const queries = query[
        key as keyof GetUserCompanyRelationsQuery
      ] as QueryOptions<any>[];
      filteredItems = queries.reduce(
        (acc, query) => filterList(acc, key, query),
        filteredItems,
      );
    }
    return Promise.resolve(filteredItems);
  }

  public updateUserCompanyRelation(
    id: string,
    body: UpdateUserCompanyRelationBody,
    _context?: ExecutionContext,
  ): Promise<void> {
    const relationIndex = MOCK_USER_COMPANY_RELATIONS.findIndex(
      (relation) => relation.id === id,
    );

    if (relationIndex === -1) {
      throw new UpdateUserCompanyRelationError(
        UpdateUserCompanyRelationErrorCode.NOT_FOUND,
        ERROR_MESSAGES[UpdateUserCompanyRelationErrorCode.NOT_FOUND],
      );
    }

    const relation = MOCK_USER_COMPANY_RELATIONS[relationIndex];
    MOCK_USER_COMPANY_RELATIONS[relationIndex] = new UserCompanyRelation({
      ...relation,
      ...body,
      updatedAt: new Date(),
    });

    return Promise.resolve();
  }

  public deleteUserCompanyRelation(
    id: string,
    _context?: ExecutionContext,
  ): Promise<void> {
    const relationIndex = MOCK_USER_COMPANY_RELATIONS.findIndex(
      (relation) => relation.id === id,
    );

    if (relationIndex === -1) {
      throw new DeleteUserCompanyRelationError(
        DeleteUserCompanyRelationErrorCode.NOT_FOUND,
        ERROR_MESSAGES[DeleteUserCompanyRelationErrorCode.NOT_FOUND],
      );
    }

    MOCK_USER_COMPANY_RELATIONS.splice(relationIndex, 1);
    return Promise.resolve();
  }
} 