import { UserRole } from '@repo/shared/domain';
import { hasExamplesCreatePermission, hasExamplesDeletePermission, hasExamplesReadPermission, hasExamplesUpdatePermission } from '../permissions.utils';

describe('Permissions Utils', () => {
  describe(hasExamplesCreatePermission.name, () => {
    it('should return false if the user has viewer role', () => {
      expect(hasExamplesCreatePermission({ role: UserRole.VIEWER })).toBe(false);
    });
    it('should return true if the user has admin role', () => {
      expect(hasExamplesCreatePermission({ role: UserRole.ADMIN })).toBe(true);
    });
  });
  describe(hasExamplesReadPermission.name, () => {
    it('should return true if the user has viewer role', () => {
      expect(hasExamplesReadPermission({ role: UserRole.VIEWER })).toBe(true);
    });
    it('should return true if the user has admin role', () => {
      expect(hasExamplesReadPermission({ role: UserRole.ADMIN })).toBe(true);
    });
  });
  describe(hasExamplesUpdatePermission.name, () => {
    it('should return false if the user has viewer role', () => {
      expect(hasExamplesCreatePermission({ role: UserRole.VIEWER })).toBe(false);
    });
    it('should return true if the user has admin role', () => {
      expect(hasExamplesCreatePermission({ role: UserRole.ADMIN })).toBe(true);
    });
  });
  describe(hasExamplesDeletePermission.name, () => {
    it('should return false if the user has viewer role', () => {
      expect(hasExamplesCreatePermission({ role: UserRole.VIEWER })).toBe(false);
    });
    it('should return true if the user has admin role', () => {
      expect(hasExamplesCreatePermission({ role: UserRole.ADMIN })).toBe(true);
    });
  });
});
