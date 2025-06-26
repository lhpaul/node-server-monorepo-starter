import { FirestoreCollectionRepository } from '@repo/shared/utils';

import { COLLECTION_PATH } from './company-update-requests.repository.constants';
import {
  CompanyUpdateRequestDocument,
  CreateCompanyUpdateRequestDocumentInput,
  UpdateCompanyUpdateRequestDocumentInput,
  QueryCompanyUpdateRequestsInput,
} from './company-update-requests.repository.interfaces';

export type {
  CompanyUpdateRequestDocument,
  CreateCompanyUpdateRequestDocumentInput,
  UpdateCompanyUpdateRequestDocumentInput,
  QueryCompanyUpdateRequestsInput,
};

export class CompanyUpdateRequestsRepository extends FirestoreCollectionRepository<CompanyUpdateRequestDocument, CreateCompanyUpdateRequestDocumentInput, UpdateCompanyUpdateRequestDocumentInput, QueryCompanyUpdateRequestsInput> {
  static readonly COLLECTION_PATH = COLLECTION_PATH;
  private static instance: CompanyUpdateRequestsRepository;
  
  public static getInstance(): CompanyUpdateRequestsRepository {
    if (!CompanyUpdateRequestsRepository.instance) {
      CompanyUpdateRequestsRepository.instance = new CompanyUpdateRequestsRepository();
    }
    return CompanyUpdateRequestsRepository.instance;
  }
  
  constructor() {
    super({
      collectionPath: COLLECTION_PATH
    });
  }
} 