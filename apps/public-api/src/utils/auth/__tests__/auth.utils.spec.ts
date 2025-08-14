import { ExecutionLogger } from '@repo/shared/definitions';
import {
  CompaniesService,
  UserCompanyRelationsService,
  UserCompanyRole,
} from '@repo/shared/domain';

import { getUserPermissions } from '../auth.utils';
import { PERMISSIONS_BY_ROLE } from '../../../constants/permissions.constants';
import { GET_USER_PERMISSIONS_STEPS, LOG_GROUP_NAME, PERMISSIONS_SUFFIXES } from '../auth.utils.constants';

// Mock the shared domain services
jest.mock('@repo/shared/domain');

describe(getUserPermissions.name, () => {
  let mockUserCompanyRelationsService: Partial<UserCompanyRelationsService>;
  let mockCompaniesService: Partial<CompaniesService>;
  let mockLogger: jest.Mocked<ExecutionLogger>;
  let mockUserCompanyRelations: any[];
  let mockCompanySubscriptions: any[][];

  const userId = 'user-123';
  const companyId1 = 'company-1';
  const companyId2 = 'company-2';

  beforeEach(() => {
    // Setup mock logger
    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
      child: jest.fn(),
      level: 'info',
      fatal: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      silent: jest.fn(),
    } as unknown as jest.Mocked<ExecutionLogger>;

    // Setup mock user company relations
    mockUserCompanyRelations = [
      {
        id: 'relation-1',
        companyId: companyId1,
        userId: userId,
        role: UserCompanyRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'relation-2',
        companyId: companyId2,
        userId: userId,
        role: UserCompanyRole.MEMBER,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Setup mock company subscriptions
    mockCompanySubscriptions = [
      [{ id: 'subscription-1', status: 'active' }], // Company 1 has active subscription
      [], // Company 2 has no subscription
    ];

    // Setup mock services
    mockUserCompanyRelationsService = {
      getUserCompanyRelations: jest.fn().mockResolvedValue(mockUserCompanyRelations),
    };

    mockCompaniesService = {
      getActiveSubscriptions: jest.fn(),
    };

    // Mock service getInstance methods
    (UserCompanyRelationsService.getInstance as jest.Mock).mockReturnValue(mockUserCompanyRelationsService);
    (CompaniesService.getInstance as jest.Mock).mockReturnValue(mockCompaniesService);

    // Setup getActiveSubscriptions to return different results for each company
    (mockCompaniesService.getActiveSubscriptions as jest.Mock)
      .mockResolvedValueOnce(mockCompanySubscriptions[0]) // For company 1
      .mockResolvedValueOnce(mockCompanySubscriptions[1]); // For company 2
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get user permissions successfully with active subscriptions', async () => {
    const result = await getUserPermissions(userId, mockLogger);

    // Verify logger calls
    expect(mockLogger.startStep).toHaveBeenCalledWith(
      GET_USER_PERMISSIONS_STEPS.GET_USER_COMPANY_RELATIONS,
      `${LOG_GROUP_NAME}.${getUserPermissions.name}`
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      GET_USER_PERMISSIONS_STEPS.GET_USER_COMPANY_RELATIONS
    );
    expect(mockLogger.startStep).toHaveBeenCalledWith(
      GET_USER_PERMISSIONS_STEPS.GET_SUBSCRIPTIONS,
      `${LOG_GROUP_NAME}.${getUserPermissions.name}`
    );
    expect(mockLogger.endStep).toHaveBeenCalledWith(
      GET_USER_PERMISSIONS_STEPS.GET_SUBSCRIPTIONS
    );

    // Verify service calls
    expect(mockUserCompanyRelationsService.getUserCompanyRelations).toHaveBeenCalledWith(userId, mockLogger);
    expect(mockCompaniesService.getActiveSubscriptions).toHaveBeenCalledWith(companyId1, mockLogger);
    expect(mockCompaniesService.getActiveSubscriptions).toHaveBeenCalledWith(companyId2, mockLogger);

    // Verify result structure
    expect(result).toEqual({
      companies: {
        [companyId1]: PERMISSIONS_BY_ROLE[UserCompanyRole.ADMIN], // Admin permissions unchanged (has subscription)
        [companyId2]: PERMISSIONS_BY_ROLE[UserCompanyRole.MEMBER], // Member permissions unchanged (no write permissions to convert)
      },
    });
  });

  it('should convert write permissions to read permissions when company has no active subscriptions', async () => {
    // Setup: Company 1 (ADMIN) has no subscriptions, Company 2 (MEMBER) has subscriptions
    mockCompanySubscriptions = [
      [], // Company 1 has no subscription
      [{ id: 'subscription-2', status: 'active' }], // Company 2 has active subscription
    ];

    // Reset the mock to ensure proper setup
    (mockCompaniesService.getActiveSubscriptions as jest.Mock).mockReset();
    (mockCompaniesService.getActiveSubscriptions as jest.Mock)
      .mockResolvedValueOnce(mockCompanySubscriptions[0]) // For company 1
      .mockResolvedValueOnce(mockCompanySubscriptions[1]); // For company 2

    const result = await getUserPermissions(userId, mockLogger);

    // Get expected permissions for admin role
    const adminPermissions = PERMISSIONS_BY_ROLE[UserCompanyRole.ADMIN];
    const expectedAdminPermissions = adminPermissions.map(permission =>
      permission.replace(PERMISSIONS_SUFFIXES.WRITE, PERMISSIONS_SUFFIXES.READ)
    );

    expect(result).toEqual({
      companies: {
        [companyId1]: expectedAdminPermissions, // Write permissions converted to read
        [companyId2]: PERMISSIONS_BY_ROLE[UserCompanyRole.MEMBER], // Member permissions unchanged
      },
    });
  });

  it('should handle user with no company relations', async () => {
    mockUserCompanyRelations = [];
    (mockUserCompanyRelationsService.getUserCompanyRelations as jest.Mock).mockResolvedValue(mockUserCompanyRelations);

    const result = await getUserPermissions(userId, mockLogger);

    expect(result).toEqual({
      companies: {},
    });

    expect(mockCompaniesService.getActiveSubscriptions).not.toHaveBeenCalled();
  });

  it('should handle user with single company relation', async () => {
    mockUserCompanyRelations = [mockUserCompanyRelations[0]]; // Only admin relation
    mockCompanySubscriptions = [[{ id: 'subscription-1', status: 'active' }]];

    (mockUserCompanyRelationsService.getUserCompanyRelations as jest.Mock).mockResolvedValue(mockUserCompanyRelations);
    (mockCompaniesService.getActiveSubscriptions as jest.Mock).mockResolvedValue(mockCompanySubscriptions[0]);

    const result = await getUserPermissions(userId, mockLogger);

    expect(result).toEqual({
      companies: {
        [companyId1]: PERMISSIONS_BY_ROLE[UserCompanyRole.ADMIN],
      },
    });

    expect(mockCompaniesService.getActiveSubscriptions).toHaveBeenCalledTimes(1);
    expect(mockCompaniesService.getActiveSubscriptions).toHaveBeenCalledWith(companyId1, mockLogger);
  });

  it('should handle service errors gracefully', async () => {
    const error = new Error('Service error');
    (mockUserCompanyRelationsService.getUserCompanyRelations as jest.Mock).mockRejectedValue(error);

    await expect(getUserPermissions(userId, mockLogger)).rejects.toThrow('Service error');

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      GET_USER_PERMISSIONS_STEPS.GET_USER_COMPANY_RELATIONS,
      `${LOG_GROUP_NAME}.${getUserPermissions.name}`
    );
    expect(mockLogger.endStep).not.toHaveBeenCalled();
  });

  it('should handle subscription service errors gracefully', async () => {
    const error = new Error('Subscription service error');
    
    // Reset the mock to ensure proper setup for error scenario
    (mockCompaniesService.getActiveSubscriptions as jest.Mock).mockReset();
    (mockCompaniesService.getActiveSubscriptions as jest.Mock).mockRejectedValue(error);

    await expect(getUserPermissions(userId, mockLogger)).rejects.toThrow('Subscription service error');

    expect(mockLogger.startStep).toHaveBeenCalledWith(
      GET_USER_PERMISSIONS_STEPS.GET_SUBSCRIPTIONS,
      `${LOG_GROUP_NAME}.${getUserPermissions.name}`
    );
    expect(mockLogger.endStep).not.toHaveBeenCalledWith(
      GET_USER_PERMISSIONS_STEPS.GET_SUBSCRIPTIONS
    );
  });

  it('should handle mixed subscription scenarios correctly', async () => {
    // Setup: Multiple companies with different subscription states
    mockUserCompanyRelations = [
      {
        id: 'relation-1',
        companyId: 'company-admin-with-sub',
        userId: userId,
        role: UserCompanyRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'relation-2',
        companyId: 'company-admin-without-sub',
        userId: userId,
        role: UserCompanyRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'relation-3',
        companyId: 'company-member',
        userId: userId,
        role: UserCompanyRole.MEMBER,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockCompanySubscriptions = [
      [{ id: 'subscription-1', status: 'active' }], // Admin with subscription
      [], // Admin without subscription
      [{ id: 'subscription-3', status: 'active' }], // Member with subscription
    ];

    (mockUserCompanyRelationsService.getUserCompanyRelations as jest.Mock).mockResolvedValue(mockUserCompanyRelations);
    (mockCompaniesService.getActiveSubscriptions as jest.Mock)
      .mockResolvedValueOnce(mockCompanySubscriptions[0])
      .mockResolvedValueOnce(mockCompanySubscriptions[1])
      .mockResolvedValueOnce(mockCompanySubscriptions[2]);

    const result = await getUserPermissions(userId, mockLogger);

    // Get expected permissions for admin role with write permissions converted to read
    const adminPermissions = PERMISSIONS_BY_ROLE[UserCompanyRole.ADMIN];
    const expectedAdminPermissionsWithoutSub = adminPermissions.map(permission =>
      permission.replace(PERMISSIONS_SUFFIXES.WRITE, PERMISSIONS_SUFFIXES.READ)
    );

    expect(result).toEqual({
      companies: {
        'company-admin-with-sub': PERMISSIONS_BY_ROLE[UserCompanyRole.ADMIN], // Unchanged (has subscription)
        'company-admin-without-sub': expectedAdminPermissionsWithoutSub, // Write permissions converted to read
        'company-member': PERMISSIONS_BY_ROLE[UserCompanyRole.MEMBER], // Unchanged (no write permissions)
      },
    });
  });
});
