import { CompaniesService } from '@repo/shared/services';
import { DomainModelServiceError, DomainModelServiceErrorCode, printError } from '@repo/shared/utils';

import { ProcessStatus } from '../../../../../../definitions';
import { CompanyUpdateRequestDocument, CompanyUpdateRequestsRepository } from '../../../../../../repositories/company-update-requests';
import { CollectionEventContext } from '../../../../../../utils/firestore/firestore.utils.interfaces';
import { FunctionLogger } from '../../../../../../utils/logging/function-logger.class';
import { ERRORS, STEPS } from '../company-update-request.on-create.constants';
import { companyUpdateRequestOnCreateHandler } from '../company-update-request.on-create.handler';

jest.mock('@repo/shared/services');
jest.mock('@repo/shared/utils', () => ({
  ...jest.requireActual('@repo/shared/utils'),
  printError: jest.fn(),
}));
jest.mock('../../../../../../repositories/company-update-requests');

describe(companyUpdateRequestOnCreateHandler.name, () => {
  let mockLogger: jest.Mocked<FunctionLogger>;
  let mockCompaniesService: jest.Mocked<CompaniesService>;
  let mockCompanyUpdateRequestsRepo: jest.Mocked<CompanyUpdateRequestsRepository>;
  let mockContext: CollectionEventContext;
  let mockDocumentData: CompanyUpdateRequestDocument;

  beforeEach(() => {
    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
    } as any;

    mockCompaniesService = {
      updateResource: jest.fn(),
    } as any;

    mockCompanyUpdateRequestsRepo = {
      updateDocument: jest.fn(),
    } as any;

    mockDocumentData = {
      id: 'request123',
      name: 'Updated Company Name',
      status: ProcessStatus.PENDING,
      error: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockContext = {
      authType: 'user',
      authId: 'user123',
      eventId: 'event123',
      params: { companyId: 'company123' },
      time: '2023-01-01T00:00:00Z',
    };

    (CompaniesService.getInstance as jest.Mock).mockReturnValue(mockCompaniesService);
    (CompanyUpdateRequestsRepository.getInstance as jest.Mock).mockReturnValue(mockCompanyUpdateRequestsRepo);
  });

  it('should successfully update company and mark request as done', async () => {
    mockCompaniesService.updateResource.mockResolvedValue(undefined);
    mockCompanyUpdateRequestsRepo.updateDocument.mockResolvedValue(undefined);

    await companyUpdateRequestOnCreateHandler({
      context: mockContext,
      documentData: mockDocumentData,
      logger: mockLogger,
    });

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_COMPANY.id);
    expect(mockCompaniesService.updateResource).toHaveBeenCalledWith(
      mockContext.params.companyId,
      { name: mockDocumentData.name },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_COMPANY.id);
    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_DONE_STATUS.id);
    expect(mockCompanyUpdateRequestsRepo.updateDocument).toHaveBeenCalledWith(
      mockDocumentData.id,
      { status: ProcessStatus.DONE },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_DONE_STATUS.id);
  });

  it('should handle company not found error', async () => {
    const error = new DomainModelServiceError({
      code: DomainModelServiceErrorCode.RESOURCE_NOT_FOUND,
      message: 'Company not found',
    });
    mockCompaniesService.updateResource.mockRejectedValue(error);
    mockCompanyUpdateRequestsRepo.updateDocument.mockResolvedValue(undefined);

    await companyUpdateRequestOnCreateHandler({
      context: mockContext,
      documentData: mockDocumentData,
      logger: mockLogger,
    });

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_INVALID_UPDATE_FAILED_STATUS.id);
    expect(mockCompanyUpdateRequestsRepo.updateDocument).toHaveBeenCalledWith(
      mockDocumentData.id,
      {
        status: ProcessStatus.FAILED,
        error: ERRORS.COMPANY_NOT_FOUND,
      },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_INVALID_UPDATE_FAILED_STATUS.id);
  });

  it('should handle invalid input error', async () => {
    const error = new DomainModelServiceError({
      code: DomainModelServiceErrorCode.INVALID_INPUT,
      message: 'Invalid input',
    });
    mockCompaniesService.updateResource.mockRejectedValue(error);
    mockCompanyUpdateRequestsRepo.updateDocument.mockResolvedValue(undefined);

    await companyUpdateRequestOnCreateHandler({
      context: mockContext,
      documentData: mockDocumentData,
      logger: mockLogger,
    });

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_INVALID_UPDATE_FAILED_STATUS.id);
    expect(mockCompanyUpdateRequestsRepo.updateDocument).toHaveBeenCalledWith(
      mockDocumentData.id,
      {
        status: ProcessStatus.FAILED,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_INVALID_UPDATE_FAILED_STATUS.id);
  });

  it('should handle unknown errors', async () => {
    const error = new Error('Unknown error');
    const printedError = 'Unknown error';
    mockCompaniesService.updateResource.mockRejectedValue(error);
    mockCompanyUpdateRequestsRepo.updateDocument.mockResolvedValue(undefined);
    (printError as jest.Mock).mockReturnValue(printedError);

    await expect(
      companyUpdateRequestOnCreateHandler({
        context: mockContext,
        documentData: mockDocumentData,
        logger: mockLogger,
      }),
    ).rejects.toThrow(error);

    expect(mockLogger.startStep).toHaveBeenCalledWith(STEPS.UPDATE_UNKNOWN_ERROR_FAILED_STATUS.id);
    expect(printError).toHaveBeenCalledWith(error);
    expect(mockCompanyUpdateRequestsRepo.updateDocument).toHaveBeenCalledWith(
      mockDocumentData.id,
      {
        status: ProcessStatus.FAILED,
        error: printedError,
      },
      mockLogger,
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(STEPS.UPDATE_UNKNOWN_ERROR_FAILED_STATUS.id);
  });
}); 