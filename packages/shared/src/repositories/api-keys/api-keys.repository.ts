import { ExecutionContext } from '../../definitions';
import { QueryOptions } from '../../definitions/listing.interfaces';
import { ApiKey } from '../../domain/models/api-key.model';
import { filterList } from '../../utils';
import {
  ERROR_MESSAGES,
  MOCK_API_KEYS,
} from './api-keys.repository.constants';
import {
  UpdateApiKeyError,
  UpdateApiKeyErrorCode,
  DeleteApiKeyError,
  DeleteApiKeyErrorCode,
} from './api-keys.repository.errors';
import {
  CreateApiKeyBody,
  GetApiKeysQuery,
  UpdateApiKeyBody,
} from './api-keys.repository.interfaces';

export class ApiKeysRepository {
  private static instance: ApiKeysRepository;

  public static getInstance(): ApiKeysRepository {
    if (!ApiKeysRepository.instance) {
      ApiKeysRepository.instance = new ApiKeysRepository();
    }
    return ApiKeysRepository.instance;
  }

  private constructor() {}

  public createApiKey(
    body: CreateApiKeyBody,
    _context?: ExecutionContext,
  ): Promise<{ id: string }> {
    const id = MOCK_API_KEYS.length.toString();
    MOCK_API_KEYS.push(
      new ApiKey({
        ...body,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    return Promise.resolve({ id });
  }

  public deleteApiKey(id: string, _context?: ExecutionContext): Promise<void> {
    const index = MOCK_API_KEYS.findIndex((key) => key.id === id);
    if (index !== -1) {
      MOCK_API_KEYS.splice(index, 1);
    } else {
      throw new DeleteApiKeyError({
        code: DeleteApiKeyErrorCode.DOCUMENT_NOT_FOUND,
        message: ERROR_MESSAGES[DeleteApiKeyErrorCode.DOCUMENT_NOT_FOUND],
      });
    }
    return Promise.resolve();
  }

  public getApiKeyById(
    id: string,
    _context?: ExecutionContext,
  ): Promise<ApiKey | null> {
    return Promise.resolve(
      MOCK_API_KEYS.find((key) => key.id === id) ?? null,
    );
  }

  public getApiKeys(
    query?: GetApiKeysQuery,
    _context?: ExecutionContext,
  ): Promise<ApiKey[]> {
    if (!query) {
      return Promise.resolve(MOCK_API_KEYS);
    }
    let filteredItems: ApiKey[] = [...MOCK_API_KEYS];
    for (const key in query) {
      const queries = query[
        key as keyof GetApiKeysQuery
      ] as QueryOptions<any>[];
      filteredItems = queries.reduce(
        (acc, query) => filterList(acc, key, query),
        filteredItems,
      );
    }
    return Promise.resolve(filteredItems);
  }

  public updateApiKey(
    id: string,
    body: UpdateApiKeyBody,
    _context?: ExecutionContext,
  ): Promise<void> {
    const index = MOCK_API_KEYS.findIndex((key) => key.id === id);
    if (index === -1) {
      throw new UpdateApiKeyError({
        code: UpdateApiKeyErrorCode.DOCUMENT_NOT_FOUND,
        message: ERROR_MESSAGES[UpdateApiKeyErrorCode.DOCUMENT_NOT_FOUND],
      });
    }

    const updatedKey = {
      ...MOCK_API_KEYS[index],
      ...body,
      updatedAt: new Date(),
    };

    MOCK_API_KEYS[index] = new ApiKey(updatedKey);
    return Promise.resolve();
  }
} 