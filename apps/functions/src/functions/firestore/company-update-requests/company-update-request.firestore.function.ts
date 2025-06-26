import { CompanyUpdateRequestDocument, CompanyUpdateRequestsRepository } from '../../../repositories/company-update-requests';
import { collectionOnWriteFunctionWrapper } from '../../../utils/firestore/firestore.utils';
import { MAX_RETRIES } from './company-update-request.firestore.constants';
import { companyUpdateRequestOnCreateHandler } from './handlers/on-create/company-update-request.on-create.handler';

export const companyUpdateRequestOnWriteFunction = collectionOnWriteFunctionWrapper<CompanyUpdateRequestDocument>({
  path: CompanyUpdateRequestsRepository.COLLECTION_PATH,
  handlers: {
    onCreate: {
      function: companyUpdateRequestOnCreateHandler,
      options: {
        maxRetries: MAX_RETRIES,
      }
    }
  }
}); 