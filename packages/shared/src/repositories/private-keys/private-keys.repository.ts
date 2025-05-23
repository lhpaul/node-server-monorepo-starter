import { ExecutionContext } from '../../definitions';
import { QueryOptions } from '../../definitions/listing.interfaces';
import { PrivateKey } from '../../domain/models/private-key.model';
import { filterList } from '../../utils';
import {
  ERROR_MESSAGES,
  MOCK_PRIVATE_KEYS,
} from './private-keys.repository.constants';
import {
  UpdatePrivateKeyError,
  UpdatePrivateKeyErrorCode,
  DeletePrivateKeyError,
  DeletePrivateKeyErrorCode,
} from './private-keys.repository.errors';
import {
  CreatePrivateKeyBody,
  GetPrivateKeysQuery,
  UpdatePrivateKeyBody,
} from './private-keys.repository.interfaces';

export class PrivateKeysRepository {
  private static instance: PrivateKeysRepository;

  public static getInstance(): PrivateKeysRepository {
    if (!PrivateKeysRepository.instance) {
      PrivateKeysRepository.instance = new PrivateKeysRepository();
    }
    return PrivateKeysRepository.instance;
  }

  private constructor() {}

  public createPrivateKey(
    body: CreatePrivateKeyBody,
    _context?: ExecutionContext,
  ): Promise<{ id: string }> {
    const id = MOCK_PRIVATE_KEYS.length.toString();
    MOCK_PRIVATE_KEYS.push(
      new PrivateKey({
        ...body,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    return Promise.resolve({ id });
  }

  public deletePrivateKey(id: string, _context?: ExecutionContext): Promise<void> {
    const index = MOCK_PRIVATE_KEYS.findIndex((key) => key.id === id);
    if (index !== -1) {
      MOCK_PRIVATE_KEYS.splice(index, 1);
    } else {
      throw new DeletePrivateKeyError({
        code: DeletePrivateKeyErrorCode.DOCUMENT_NOT_FOUND,
        message: ERROR_MESSAGES[DeletePrivateKeyErrorCode.DOCUMENT_NOT_FOUND],
      });
    }
    return Promise.resolve();
  }

  public getPrivateKeyById(
    id: string,
    _context?: ExecutionContext,
  ): Promise<PrivateKey | null> {
    return Promise.resolve(
      MOCK_PRIVATE_KEYS.find((key) => key.id === id) ?? null,
    );
  }

  public getPrivateKeys(
    query?: GetPrivateKeysQuery,
    _context?: ExecutionContext,
  ): Promise<PrivateKey[]> {
    if (!query) {
      return Promise.resolve(MOCK_PRIVATE_KEYS);
    }
    let filteredItems: PrivateKey[] = [...MOCK_PRIVATE_KEYS];
    for (const key in query) {
      const queries = query[
        key as keyof GetPrivateKeysQuery
      ] as QueryOptions<any>[];
      filteredItems = queries.reduce(
        (acc, query) => filterList(acc, key, query),
        filteredItems,
      );
    }
    return Promise.resolve(filteredItems);
  }

  public updatePrivateKey(
    id: string,
    body: UpdatePrivateKeyBody,
    _context?: ExecutionContext,
  ): Promise<void> {
    const index = MOCK_PRIVATE_KEYS.findIndex((key) => key.id === id);
    if (index === -1) {
      throw new UpdatePrivateKeyError({
        code: UpdatePrivateKeyErrorCode.DOCUMENT_NOT_FOUND,
        message: ERROR_MESSAGES[UpdatePrivateKeyErrorCode.DOCUMENT_NOT_FOUND],
      });
    }

    const updatedKey = {
      ...MOCK_PRIVATE_KEYS[index],
      ...body,
      updatedAt: new Date(),
    };

    MOCK_PRIVATE_KEYS[index] = new PrivateKey(updatedKey);
    return Promise.resolve();
  }
} 