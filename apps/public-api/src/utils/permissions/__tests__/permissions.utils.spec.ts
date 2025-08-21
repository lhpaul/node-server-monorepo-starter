import { UserPermissions } from '../../../definitions/auth.interfaces';
import {
  hasCompanyReadPermission,
  hasCompanyUpdatePermission,
  hasCompanyDeletePermission,
  hasCompanyTransactionsCreatePermission,
  hasCompanyTransactionsReadPermission,
  hasCompanyTransactionsUpdatePermission,
  hasCompanyTransactionsDeletePermission,
  hasCompanySubscriptionsReadPermission,
  hasCompanyFinancialInstitutionsCreatePermission,
  hasCompanyFinancialInstitutionsReadPermission,
  hasCompanyFinancialInstitutionsUpdatePermission,
  hasCompanyFinancialInstitutionsDeletePermission,
  hasCompanyFinancialInstitutionsListPermission,
  hasCompanyFinancialInstitutionsGetPermission,
} from '../permissions.utils';

describe('Auth Utils', () => {
  const mockCompanyId = 'company-123';
  const mockPermissions: UserPermissions = {
    companies: {
      'company-123': ['company:read', 'company:update'],
      'company-456': ['company:write'],
    },
  };

  describe('Company Permissions', () => {
    describe(hasCompanyReadPermission.name, () => {
      it('should return true when user has company:read permission', () => {
        const result = hasCompanyReadPermission(mockCompanyId, mockPermissions);
        expect(result).toBe(true);
      });

      it('should return true when user has company:write permission', () => {
        const permissions: UserPermissions = {
          companies: {
            'company-123': ['company:write'],
          },
        };
        const result = hasCompanyReadPermission(mockCompanyId, permissions);
        expect(result).toBe(true);
      });

      it('should return false when user has no read or write permissions', () => {
        const permissions: UserPermissions = {
          companies: {
            'company-123': ['company:update'],
          },
        };
        const result = hasCompanyReadPermission(mockCompanyId, permissions);
        expect(result).toBe(false);
      });

      it('should return undefined when company does not exist in permissions', () => {
        const result = hasCompanyReadPermission('non-existent-company', mockPermissions);
        expect(result).toBeUndefined();
      });
    });

    describe(hasCompanyUpdatePermission.name, () => {
      it('should return true when user has company:update permission', () => {
        const result = hasCompanyUpdatePermission(mockCompanyId, mockPermissions);
        expect(result).toBe(true);
      });

      it('should return true when user has company:write permission', () => {
        const permissions: UserPermissions = {
          companies: {
            'company-123': ['company:write'],
          },
        };
        const result = hasCompanyUpdatePermission(mockCompanyId, permissions);
        expect(result).toBe(true);
      });

      it('should return false when user has no update or write permissions', () => {
        const permissions: UserPermissions = {
          companies: {
            'company-123': ['company:read'],
          },
        };
        const result = hasCompanyUpdatePermission(mockCompanyId, permissions);
        expect(result).toBe(false);
      });

      it('should return undefined when company does not exist in permissions', () => {
        const result = hasCompanyUpdatePermission('non-existent-company', mockPermissions);
        expect(result).toBeUndefined();
      });
    });

    describe(hasCompanyDeletePermission.name, () => {
      it('should return true when user has company:delete permission', () => {
        const permissions: UserPermissions = {
          companies: {
            'company-123': ['company:delete'],
          },
        };
        const result = hasCompanyDeletePermission(mockCompanyId, permissions);
        expect(result).toBe(true);
      });

      it('should return true when user has company:write permission', () => {
        const permissions: UserPermissions = {
          companies: {
            'company-123': ['company:write'],
          },
        };
        const result = hasCompanyDeletePermission(mockCompanyId, permissions);
        expect(result).toBe(true);
      });

      it('should return false when user has no delete or write permissions', () => {
        const result = hasCompanyDeletePermission(mockCompanyId, mockPermissions);
        expect(result).toBe(false);
      });

      it('should return undefined when company does not exist in permissions', () => {
        const result = hasCompanyDeletePermission('non-existent-company', mockPermissions);
        expect(result).toBeUndefined();
      });
    });

    describe(hasCompanySubscriptionsReadPermission.name, () => {
      it('should return true when user has subscriptions:read permission', () => {
        const result = hasCompanySubscriptionsReadPermission(mockCompanyId, {
          companies: {
            ...mockPermissions.companies,
            [mockCompanyId]: ['subscriptions:read'],
          },
        });
        expect(result).toBe(true);
      });

      it('should return false when user has no read or write permissions', () => {
        const result = hasCompanySubscriptionsReadPermission(mockCompanyId, mockPermissions);
        expect(result).toBe(false);
      });

      it('should return undefined when company does not exist in permissions', () => {
        const result = hasCompanySubscriptionsReadPermission('non-existent-company', mockPermissions);
        expect(result).toBeUndefined();
      });
    });
  });

  describe('Transaction Permissions', () => {
    const mockTransactionPermissions: UserPermissions = {
      companies: {
        'company-123': ['transactions:read', 'transactions:update'],
        'company-456': ['transactions:write'],
      },
    };

    describe(hasCompanyTransactionsCreatePermission.name, () => {
      it('should return true when user has transactions:create permission', () => {
        const permissions: UserPermissions = {
          companies: {
            'company-123': ['transactions:create'],
          },
        };
        const result = hasCompanyTransactionsCreatePermission(mockCompanyId, permissions);
        expect(result).toBe(true);
      });

      it('should return true when user has transactions:write permission', () => {
        const result = hasCompanyTransactionsCreatePermission('company-456', mockTransactionPermissions);
        expect(result).toBe(true);
      });

      it('should return false when user has no create or write permissions', () => {
        const result = hasCompanyTransactionsCreatePermission(mockCompanyId, mockTransactionPermissions);
        expect(result).toBe(false);
      });

      it('should return undefined when company does not exist in permissions', () => {
        const result = hasCompanyTransactionsCreatePermission('non-existent-company', mockTransactionPermissions);
        expect(result).toBeUndefined();
      });
    });

    describe(hasCompanyTransactionsReadPermission.name, () => {
      it('should return true when user has transactions:read permission', () => {
        const result = hasCompanyTransactionsReadPermission(mockCompanyId, mockTransactionPermissions);
        expect(result).toBe(true);
      });

      it('should return true when user has transactions:write permission', () => {
        const result = hasCompanyTransactionsReadPermission('company-456', mockTransactionPermissions);
        expect(result).toBe(true);
      });

      it('should return false when user has no read or write permissions', () => {
        const permissions: UserPermissions = {
          companies: {
            'company-123': ['transactions:update'],
          },
        };
        const result = hasCompanyTransactionsReadPermission(mockCompanyId, permissions);
        expect(result).toBe(false);
      });

      it('should return undefined when company does not exist in permissions', () => {
        const result = hasCompanyTransactionsReadPermission('non-existent-company', mockTransactionPermissions);
        expect(result).toBeUndefined();
      });
    });

    describe(hasCompanyTransactionsUpdatePermission.name, () => {
      it('should return true when user has transactions:update permission', () => {
        const result = hasCompanyTransactionsUpdatePermission(mockCompanyId, mockTransactionPermissions);
        expect(result).toBe(true);
      });

      it('should return true when user has transactions:write permission', () => {
        const result = hasCompanyTransactionsUpdatePermission('company-456', mockTransactionPermissions);
        expect(result).toBe(true);
      });

      it('should return false when user has no update or write permissions', () => {
        const permissions: UserPermissions = {
          companies: {
            'company-123': ['transactions:read'],
          },
        };
        const result = hasCompanyTransactionsUpdatePermission(mockCompanyId, permissions);
        expect(result).toBe(false);
      });

      it('should return undefined when company does not exist in permissions', () => {
        const result = hasCompanyTransactionsUpdatePermission('non-existent-company', mockTransactionPermissions);
        expect(result).toBeUndefined();
      });
    });

    describe(hasCompanyTransactionsDeletePermission.name, () => {
      it('should return true when user has transactions:delete permission', () => {
        const permissions: UserPermissions = {
          companies: {
            'company-123': ['transactions:delete'],
          },
        };
        const result = hasCompanyTransactionsDeletePermission(mockCompanyId, permissions);
        expect(result).toBe(true);
      });

      it('should return true when user has transactions:write permission', () => {
        const result = hasCompanyTransactionsDeletePermission('company-456', mockTransactionPermissions);
        expect(result).toBe(true);
      });

      it('should return false when user has no delete or write permissions', () => {
        const result = hasCompanyTransactionsDeletePermission(mockCompanyId, mockTransactionPermissions);
        expect(result).toBe(false);
      });

      it('should return undefined when company does not exist in permissions', () => {
        const result = hasCompanyTransactionsDeletePermission('non-existent-company', mockTransactionPermissions);
        expect(result).toBeUndefined();
      });
    });
  });

  describe('Financial Institution Permissions', () => {
    const mockFinancialInstitutionPermissions: UserPermissions = {
      companies: {
        'company-123': ['financial-institutions:read', 'financial-institutions:update'],
        'company-456': ['financial-institutions:write'],
      },
    };

    describe(hasCompanyFinancialInstitutionsCreatePermission.name, () => {
      it('should return true when user has financial-institutions:create permission', () => {
        const permissions: UserPermissions = {
          companies: {
            'company-123': ['financial-institutions:create'],
          },
        };
        const result = hasCompanyFinancialInstitutionsCreatePermission(mockCompanyId, permissions);
        expect(result).toBe(true);
      });

      it('should return true when user has financial-institutions:write permission', () => {
        const result = hasCompanyFinancialInstitutionsCreatePermission('company-456', mockFinancialInstitutionPermissions);
        expect(result).toBe(true);
      });

      it('should return false when user has no create or write permissions', () => {
        const result = hasCompanyFinancialInstitutionsCreatePermission(mockCompanyId, mockFinancialInstitutionPermissions);
        expect(result).toBe(false);
      });

      it('should return undefined when company does not exist in permissions', () => {
        const result = hasCompanyFinancialInstitutionsCreatePermission('non-existent-company', mockFinancialInstitutionPermissions);
        expect(result).toBeUndefined();
      });
    });

    describe(hasCompanyFinancialInstitutionsReadPermission.name, () => {
      it('should return true when user has financial-institutions:read permission', () => {
        const result = hasCompanyFinancialInstitutionsReadPermission(mockCompanyId, mockFinancialInstitutionPermissions);
        expect(result).toBe(true);
      });

      it('should return true when user has financial-institutions:write permission', () => {
        const result = hasCompanyFinancialInstitutionsReadPermission('company-456', mockFinancialInstitutionPermissions);
        expect(result).toBe(true);
      });

      it('should return false when user has no read or write permissions', () => {
        const permissions: UserPermissions = {
          companies: {
            'company-123': ['financial-institutions:update'],
          },
        };
        const result = hasCompanyFinancialInstitutionsReadPermission(mockCompanyId, permissions);
        expect(result).toBe(false);
      });

      it('should return undefined when company does not exist in permissions', () => {
        const result = hasCompanyFinancialInstitutionsReadPermission('non-existent-company', mockFinancialInstitutionPermissions);
        expect(result).toBeUndefined();
      });
    });

    describe(hasCompanyFinancialInstitutionsUpdatePermission.name, () => {
      it('should return true when user has financial-institutions:update permission', () => {
        const result = hasCompanyFinancialInstitutionsUpdatePermission(mockCompanyId, mockFinancialInstitutionPermissions);
        expect(result).toBe(true);
      });

      it('should return true when user has financial-institutions:write permission', () => {
        const result = hasCompanyFinancialInstitutionsUpdatePermission('company-456', mockFinancialInstitutionPermissions);
        expect(result).toBe(true);
      });

      it('should return false when user has no update or write permissions', () => {
        const permissions: UserPermissions = {
          companies: {
            'company-123': ['financial-institutions:read'],
          },
        };
        const result = hasCompanyFinancialInstitutionsUpdatePermission(mockCompanyId, permissions);
        expect(result).toBe(false);
      });

      it('should return undefined when company does not exist in permissions', () => {
        const result = hasCompanyFinancialInstitutionsUpdatePermission('non-existent-company', mockFinancialInstitutionPermissions);
        expect(result).toBeUndefined();
      });
    });

    describe(hasCompanyFinancialInstitutionsDeletePermission.name, () => {
      it('should return true when user has financial-institutions:delete permission', () => {
        const permissions: UserPermissions = {
          companies: {
            'company-123': ['financial-institutions:delete'],
          },
        };
        const result = hasCompanyFinancialInstitutionsDeletePermission(mockCompanyId, permissions);
        expect(result).toBe(true);
      });

      it('should return true when user has financial-institutions:write permission', () => {
        const result = hasCompanyFinancialInstitutionsDeletePermission('company-456', mockFinancialInstitutionPermissions);
        expect(result).toBe(true);
      });

      it('should return false when user has no delete or write permissions', () => {
        const result = hasCompanyFinancialInstitutionsDeletePermission(mockCompanyId, mockFinancialInstitutionPermissions);
        expect(result).toBe(false);
      });

      it('should return undefined when company does not exist in permissions', () => {
        const result = hasCompanyFinancialInstitutionsDeletePermission('non-existent-company', mockFinancialInstitutionPermissions);
        expect(result).toBeUndefined();
      });
    });

    describe(hasCompanyFinancialInstitutionsListPermission.name, () => {
      it('should return true when user has financial-institutions:read permission', () => {
        const result = hasCompanyFinancialInstitutionsListPermission(mockCompanyId, mockFinancialInstitutionPermissions);
        expect(result).toBe(true);
      });

      it('should return true when user has financial-institutions:write permission', () => {
        const result = hasCompanyFinancialInstitutionsListPermission('company-456', mockFinancialInstitutionPermissions);
        expect(result).toBe(true);
      });

      it('should return false when user has no read or write permissions', () => {
        const permissions: UserPermissions = {
          companies: {
            'company-123': ['financial-institutions:update'],
          },
        };
        const result = hasCompanyFinancialInstitutionsListPermission(mockCompanyId, permissions);
        expect(result).toBe(false);
      });

      it('should return undefined when company does not exist in permissions', () => {
        const result = hasCompanyFinancialInstitutionsListPermission('non-existent-company', mockFinancialInstitutionPermissions);
        expect(result).toBeUndefined();
      });
    });

    describe(hasCompanyFinancialInstitutionsGetPermission.name, () => {
      it('should return true when user has financial-institutions:read permission', () => {
        const result = hasCompanyFinancialInstitutionsGetPermission(mockCompanyId, mockFinancialInstitutionPermissions);
        expect(result).toBe(true);
      });

      it('should return true when user has financial-institutions:write permission', () => {
        const result = hasCompanyFinancialInstitutionsGetPermission('company-456', mockFinancialInstitutionPermissions);
        expect(result).toBe(true);
      });

      it('should return false when user has no read or write permissions', () => {
        const permissions: UserPermissions = {
          companies: {
            'company-123': ['financial-institutions:update'],
          },
        };
        const result = hasCompanyFinancialInstitutionsGetPermission(mockCompanyId, permissions);
        expect(result).toBe(false);
      });

      it('should return undefined when company does not exist in permissions', () => {
        const result = hasCompanyFinancialInstitutionsGetPermission('non-existent-company', mockFinancialInstitutionPermissions);
        expect(result).toBeUndefined();
      });
    });
  });
});
