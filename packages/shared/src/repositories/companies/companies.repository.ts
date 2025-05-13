import { ExecutionContext } from '../../definitions';
import { QueryOptions } from '../../definitions/listing.interfaces';
import { Company } from '../../domain/models/company.model';
import { filterList } from '../../utils';
import {
  ERROR_MESSAGES,
  MOCK_COMPANIES,
} from './companies.repository.constants';
import {
  UpdateCompanyError,
  UpdateCompanyErrorCode,
  DeleteCompanyError,
  DeleteCompanyErrorCode,
} from './companies.repository.errors';
import {
  CreateCompanyBody,
  GetCompaniesQuery,
  UpdateCompanyBody,
} from './companies.repository.interfaces';

export class CompaniesRepository {
  private static instance: CompaniesRepository;

  public static getInstance(): CompaniesRepository {
    if (!CompaniesRepository.instance) {
      CompaniesRepository.instance = new CompaniesRepository();
    }
    return CompaniesRepository.instance;
  }

  private constructor() {}

  public createCompany(
    body: CreateCompanyBody,
    _context?: ExecutionContext,
  ): Promise<{ id: string }> {
    const id = MOCK_COMPANIES.length.toString();
    MOCK_COMPANIES.push(
      new Company({
        ...body,
        id,
      }),
    );
    return Promise.resolve({ id });
  }

  public deleteCompany(id: string, _context?: ExecutionContext): Promise<void> {
    const index = MOCK_COMPANIES.findIndex((c) => c.id === id);
    if (index !== -1) {
      MOCK_COMPANIES.splice(index, 1);
    } else {
      throw new DeleteCompanyError({
        code: DeleteCompanyErrorCode.DOCUMENT_NOT_FOUND,
        message: ERROR_MESSAGES[DeleteCompanyErrorCode.DOCUMENT_NOT_FOUND],
      });
    }
    return Promise.resolve();
  }

  public getCompanyById(
    id: string,
    _context?: ExecutionContext,
  ): Promise<Company | null> {
    return Promise.resolve(
      MOCK_COMPANIES.find((company) => company.id === id) ?? null,
    );
  }

  public getCompanies(
    query?: GetCompaniesQuery,
    _context?: ExecutionContext,
  ): Promise<Company[]> {
    if (!query) {
      return Promise.resolve(MOCK_COMPANIES);
    }
    let filteredItems: Company[] = [...MOCK_COMPANIES];
    for (const key in query) {
      const queries = query[
        key as keyof GetCompaniesQuery
      ] as QueryOptions<any>[];
      filteredItems = queries.reduce(
        (acc, query) => filterList(acc, key, query),
        filteredItems,
      );
    }
    return Promise.resolve(filteredItems);
  }

  public updateCompany(
    id: string,
    body: UpdateCompanyBody,
    _context?: ExecutionContext,
  ): Promise<void> {
    const index = MOCK_COMPANIES.findIndex((c) => c.id === id);
    if (index !== -1) {
      MOCK_COMPANIES[index] = new Company({
        ...MOCK_COMPANIES[index],
        ...body,
      });
    } else {
      throw new UpdateCompanyError({
        code: UpdateCompanyErrorCode.DOCUMENT_NOT_FOUND,
        message: ERROR_MESSAGES[UpdateCompanyErrorCode.DOCUMENT_NOT_FOUND],
      });
    }
    return Promise.resolve();
  }
}
