import { Company } from '@repo/shared/domain';
import { CompaniesService } from '@repo/shared/services';
import { DomainModelServiceError, DomainModelServiceErrorCode, printError } from '@repo/shared/utils';

import { ProcessStatus } from '../../../../../definitions';
import { CompanyUpdateRequestDocument, CompanyUpdateRequestsRepository } from '../../../../../repositories/company-update-requests';
import { CollectionEventContext } from '../../../../../utils/firestore/firestore.utils.interfaces';
import { FunctionLogger } from '../../../../../utils/logging/function-logger.class';
import { ERRORS, STEPS } from './company-update-request.on-create.constants';

export async function companyUpdateRequestOnCreateHandler<DocumentModel extends CompanyUpdateRequestDocument>({
  context,
  documentData: companyUpdateRequest,
  logger
}: {
  context: CollectionEventContext;
  documentData: DocumentModel;
  logger: FunctionLogger;
}): Promise<void> {
  const companyUpdateRequestsRepo = CompanyUpdateRequestsRepository.getInstance();
  try {
    logger.startStep(STEPS.UPDATE_COMPANY.id);
    const updateData: Partial<Company> = {
      ...(companyUpdateRequest.name && { name: companyUpdateRequest.name }),
    };
    // Extract companyId from the document path
    const companyId = context.params.companyId;
    await CompaniesService.getInstance().updateResource(companyId, updateData, logger)
    .finally(() => logger.endStep(STEPS.UPDATE_COMPANY.id));
    logger.startStep(STEPS.UPDATE_DONE_STATUS.id);
    await companyUpdateRequestsRepo.updateDocument(companyUpdateRequest.id, {
      status: ProcessStatus.DONE,
    }, logger)
    .finally(() => logger.endStep(STEPS.UPDATE_DONE_STATUS.id));
  } catch (error) {
    if (error instanceof DomainModelServiceError) {
      let errorData: { code: string, message: string } | null = null;
      if (error.code === DomainModelServiceErrorCode.INVALID_INPUT) {
        errorData = {
          code: error.code,
          message: error.message
        };
      }
      if (error.code === DomainModelServiceErrorCode.RESOURCE_NOT_FOUND) {
        errorData = ERRORS.COMPANY_NOT_FOUND;
      }
      if (errorData) {
        logger.startStep(STEPS.UPDATE_INVALID_UPDATE_FAILED_STATUS.id);
        await companyUpdateRequestsRepo.updateDocument(companyUpdateRequest.id, {
          status: ProcessStatus.FAILED,
          error: errorData,
        }, logger)
        .finally(() => logger.endStep(STEPS.UPDATE_INVALID_UPDATE_FAILED_STATUS.id));
        return;
      }
    }
    logger.startStep(STEPS.UPDATE_UNKNOWN_ERROR_FAILED_STATUS.id);
    await companyUpdateRequestsRepo.updateDocument(companyUpdateRequest.id, {
      status: ProcessStatus.FAILED,
      error: printError(error),
    }, logger)
    .finally(() => logger.endStep(STEPS.UPDATE_UNKNOWN_ERROR_FAILED_STATUS.id));
    throw error;
  }
} 