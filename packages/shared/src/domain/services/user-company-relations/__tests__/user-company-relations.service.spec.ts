// Internal modules (farthest path first, then alphabetical)
import { ExecutionLogger } from '../../../../definitions';
import { UserCompanyRelation, UserCompanyRole } from '../../../entities/user-company-relation.model';
import { UserCompanyRelationsRepository } from '../../../../repositories';
import {
  CreateUserCompanyRelationDocumentInput,
  QueryUserCompanyRelationsInput,
  UpdateUserCompanyRelationDocumentInput,
  UserCompanyRelationDocument,
} from '../../../../repositories/user-company-relations/user-company-relations.repository.interfaces';

// Local imports (alphabetical)
import {
  CreateUserCompanyRelationInput,
  FilterUserCompanyRelationsInput,
  UpdateUserCompanyRelationInput,
} from '../user-company-relations.service.interfaces';
import { UserCompanyRelationsService } from '../user-company-relations.service';

jest.mock('../../../../repositories');

describe(UserCompanyRelationsService.name, () => {
  let mockUserCompanyRelationsRepository: jest.Mocked<UserCompanyRelationsRepository>;
  let mockLogger: jest.Mocked<ExecutionLogger>;
  let userCompanyRelationsService: UserCompanyRelationsService;

  const mockUserId = 'user-123';
  const mockCompanyId = 'company-456';
  const mockRole = 'admin';
  const mockRelationId = 'relation-789';

  const mockCreateInput: CreateUserCompanyRelationInput = {
    userId: mockUserId,
    companyId: mockCompanyId,
    role: mockRole,
  };

  const mockCreateDocumentInput: CreateUserCompanyRelationDocumentInput = {
    userId: mockUserId,
    companyId: mockCompanyId,
    role: mockRole,
  };

  const mockUpdateInput: UpdateUserCompanyRelationInput = {
    role: 'member',
  };

  const mockUpdateDocumentInput: UpdateUserCompanyRelationDocumentInput = {
    role: 'member',
  };

  const mockDocument: UserCompanyRelationDocument = {
    id: mockRelationId,
    userId: mockUserId,
    companyId: mockCompanyId,
    role: mockRole,
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z'),
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create mock repository instance
    mockUserCompanyRelationsRepository = {
      createDocument: jest.fn(),
      deleteDocument: jest.fn(),
      getDocument: jest.fn(),
      getDocumentsList: jest.fn(),
      updateDocument: jest.fn(),
    } as unknown as jest.Mocked<UserCompanyRelationsRepository>;

    // Create mock logger
    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
    } as unknown as jest.Mocked<ExecutionLogger>;

    // Setup the mock to return our mock instance
    (UserCompanyRelationsRepository.getInstance as jest.Mock).mockReturnValue(mockUserCompanyRelationsRepository);

    // Reset the singleton instance before each test
    (UserCompanyRelationsService as any).instance = undefined;

    // Get the service instance
    userCompanyRelationsService = UserCompanyRelationsService.getInstance();
  });

  describe(UserCompanyRelationsService.getInstance.name, () => {
    it('should create a new instance when one does not exist', () => {
      const service = UserCompanyRelationsService.getInstance();

      expect(service).toBeInstanceOf(UserCompanyRelationsService);
      expect(UserCompanyRelationsRepository.getInstance).toHaveBeenCalledTimes(1);
    });

    it('should return the same instance on subsequent calls', () => {
      const firstInstance = UserCompanyRelationsService.getInstance();
      const secondInstance = UserCompanyRelationsService.getInstance();

      expect(firstInstance).toBe(secondInstance);
      expect(UserCompanyRelationsRepository.getInstance).toHaveBeenCalledTimes(1);
    });
  });

  describe(UserCompanyRelationsService.prototype.createResource.name, () => {
    it('should create a new user company relation', async () => {
      mockUserCompanyRelationsRepository.createDocument.mockResolvedValue(mockRelationId);

      const result = await userCompanyRelationsService.createResource(mockCreateInput, mockLogger);

      expect(result).toBe(mockRelationId);
      expect(mockUserCompanyRelationsRepository.createDocument).toHaveBeenCalledWith(mockCreateDocumentInput, mockLogger);
    });

    it('should throw an error when repository creation fails', async () => {
      const error = new Error('Creation failed');
      mockUserCompanyRelationsRepository.createDocument.mockRejectedValue(error);

      await expect(userCompanyRelationsService.createResource(mockCreateInput, mockLogger)).rejects.toThrow('Creation failed');
      expect(mockUserCompanyRelationsRepository.createDocument).toHaveBeenCalledWith(mockCreateDocumentInput, mockLogger);
    });
  });

  describe(UserCompanyRelationsService.prototype.getResource.name, () => {
    it('should return a user company relation when found', async () => {
      mockUserCompanyRelationsRepository.getDocument.mockResolvedValue(mockDocument);

      const result = await userCompanyRelationsService.getResource(mockRelationId, mockLogger);

      expect(result).toBeInstanceOf(UserCompanyRelation);
      expect(result?.id).toBe(mockRelationId);
      expect(result?.userId).toBe(mockUserId);
      expect(result?.companyId).toBe(mockCompanyId);
      expect(result?.role).toBe(UserCompanyRole.ADMIN);
      expect(mockUserCompanyRelationsRepository.getDocument).toHaveBeenCalledWith(mockRelationId, mockLogger);
    });

    it('should return null when user company relation is not found', async () => {
      mockUserCompanyRelationsRepository.getDocument.mockResolvedValue(null);

      const result = await userCompanyRelationsService.getResource(mockRelationId, mockLogger);

      expect(result).toBeNull();
      expect(mockUserCompanyRelationsRepository.getDocument).toHaveBeenCalledWith(mockRelationId, mockLogger);
    });

    it('should handle role conversion from string to enum', async () => {
      const memberDocument = { ...mockDocument, role: 'member' };
      mockUserCompanyRelationsRepository.getDocument.mockResolvedValue(memberDocument);

      const result = await userCompanyRelationsService.getResource(mockRelationId, mockLogger);

      expect(result?.role).toBe(UserCompanyRole.MEMBER);
    });

    it('should throw an error when repository get fails', async () => {
      const error = new Error('Get failed');
      mockUserCompanyRelationsRepository.getDocument.mockRejectedValue(error);

      await expect(userCompanyRelationsService.getResource(mockRelationId, mockLogger)).rejects.toThrow('Get failed');
      expect(mockUserCompanyRelationsRepository.getDocument).toHaveBeenCalledWith(mockRelationId, mockLogger);
    });
  });

  describe(UserCompanyRelationsService.prototype.getResourcesList.name, () => {
    const mockFilterInput: FilterUserCompanyRelationsInput = {
      companyId: [{ value: mockCompanyId, operator: '==' }],
    };

    const mockQueryInput: QueryUserCompanyRelationsInput = {
      companyId: [{ value: mockCompanyId, operator: '==' }],
    };

    it('should return a list of user company relations', async () => {
      const mockDocuments = [mockDocument];
      mockUserCompanyRelationsRepository.getDocumentsList.mockResolvedValue(mockDocuments);

      const result = await userCompanyRelationsService.getResourcesList(mockFilterInput, mockLogger);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(UserCompanyRelation);
      expect(result[0].id).toBe(mockRelationId);
      expect(result[0].userId).toBe(mockUserId);
      expect(result[0].companyId).toBe(mockCompanyId);
      expect(result[0].role).toBe(UserCompanyRole.ADMIN);
      expect(mockUserCompanyRelationsRepository.getDocumentsList).toHaveBeenCalledWith(mockQueryInput, mockLogger);
    });

    it('should return empty array when no relations found', async () => {
      mockUserCompanyRelationsRepository.getDocumentsList.mockResolvedValue([]);

      const result = await userCompanyRelationsService.getResourcesList(mockFilterInput, mockLogger);

      expect(result).toHaveLength(0);
      expect(mockUserCompanyRelationsRepository.getDocumentsList).toHaveBeenCalledWith(mockQueryInput, mockLogger);
    });

    it('should handle role conversion for multiple documents', async () => {
      const memberDocument = { ...mockDocument, role: 'member' };
      const adminDocument = { ...mockDocument, id: 'relation-456', role: 'admin' };
      const mockDocuments = [memberDocument, adminDocument];
      mockUserCompanyRelationsRepository.getDocumentsList.mockResolvedValue(mockDocuments);

      const result = await userCompanyRelationsService.getResourcesList(mockFilterInput, mockLogger);

      expect(result).toHaveLength(2);
      expect(result[0].role).toBe(UserCompanyRole.MEMBER);
      expect(result[1].role).toBe(UserCompanyRole.ADMIN);
    });

    it('should throw an error when repository get list fails', async () => {
      const error = new Error('Get list failed');
      mockUserCompanyRelationsRepository.getDocumentsList.mockRejectedValue(error);

      await expect(userCompanyRelationsService.getResourcesList(mockFilterInput, mockLogger)).rejects.toThrow('Get list failed');
      expect(mockUserCompanyRelationsRepository.getDocumentsList).toHaveBeenCalledWith(mockQueryInput, mockLogger);
    });
  });

  describe(UserCompanyRelationsService.prototype.getUserCompanyRelations.name, () => {
    it('should return a list of user company relations', async () => {
      const mockDocuments = [mockDocument];
      mockUserCompanyRelationsRepository.getDocumentsList.mockResolvedValue(mockDocuments);

      const result = await userCompanyRelationsService.getUserCompanyRelations(mockUserId, mockLogger);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(UserCompanyRelation);
      expect(result[0].id).toBe(mockRelationId);
      expect(result[0].userId).toBe(mockUserId);
      expect(result[0].companyId).toBe(mockCompanyId);
      expect(result[0].role).toBe(UserCompanyRole.ADMIN);
      expect(mockUserCompanyRelationsRepository.getDocumentsList).toHaveBeenCalledWith({
        userId: [{ operator: '==', value: mockUserId }],
      }, mockLogger);
    });
  });

  describe(UserCompanyRelationsService.prototype.updateResource.name, () => {
    it('should update a user company relation', async () => {
      mockUserCompanyRelationsRepository.updateDocument.mockResolvedValue();

      await userCompanyRelationsService.updateResource(mockRelationId, mockUpdateInput, mockLogger);

      expect(mockUserCompanyRelationsRepository.updateDocument).toHaveBeenCalledWith(mockRelationId, mockUpdateDocumentInput, mockLogger);
    });

    it('should throw an error when repository update fails', async () => {
      const error = new Error('Update failed');
      mockUserCompanyRelationsRepository.updateDocument.mockRejectedValue(error);

      await expect(userCompanyRelationsService.updateResource(mockRelationId, mockUpdateInput, mockLogger)).rejects.toThrow('Update failed');
      expect(mockUserCompanyRelationsRepository.updateDocument).toHaveBeenCalledWith(mockRelationId, mockUpdateDocumentInput, mockLogger);
    });
  });

  describe(UserCompanyRelationsService.prototype.deleteResource.name, () => {
    it('should delete a user company relation', async () => {
      mockUserCompanyRelationsRepository.deleteDocument.mockResolvedValue();

      await userCompanyRelationsService.deleteResource(mockRelationId, mockLogger);

      expect(mockUserCompanyRelationsRepository.deleteDocument).toHaveBeenCalledWith(mockRelationId, mockLogger);
    });

    it('should throw an error when repository delete fails', async () => {
      const error = new Error('Delete failed');
      mockUserCompanyRelationsRepository.deleteDocument.mockRejectedValue(error);

      await expect(userCompanyRelationsService.deleteResource(mockRelationId, mockLogger)).rejects.toThrow('Delete failed');
      expect(mockUserCompanyRelationsRepository.deleteDocument).toHaveBeenCalledWith(mockRelationId, mockLogger);
    });
  });
});
