import { UserDocument } from '../../../../repositories';
import { UserRole } from '../../../entities';
import { ERRORS_MESSAGES } from '../user.services.constants';
import { UsersDocumentToEntityParser } from '../users.service.classes';

describe(UsersDocumentToEntityParser.name, () => {
  const mockUserDocument: UserDocument = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'admin',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  };

  describe('constructor', () => {
    it('should create an instance with valid ADMIN role', () => {
      const parser = new UsersDocumentToEntityParser(mockUserDocument);

      expect(parser).toBeInstanceOf(UsersDocumentToEntityParser);
      expect(parser.id).toBe(mockUserDocument.id);
      expect(parser.email).toBe(mockUserDocument.email);
      expect(parser.role).toBe(UserRole.ADMIN);
      expect(parser.createdAt).toBe(mockUserDocument.createdAt);
      expect(parser.updatedAt).toBe(mockUserDocument.updatedAt);
    });

    it('should create an instance with valid VIEWER role', () => {
      const viewerDocument: UserDocument = {
        ...mockUserDocument,
        role: 'viewer',
      };

      const parser = new UsersDocumentToEntityParser(viewerDocument);

      expect(parser).toBeInstanceOf(UsersDocumentToEntityParser);
      expect(parser.role).toBe(UserRole.VIEWER);
    });

    it('should throw an error when role is invalid', () => {
      const invalidRoleDocument: UserDocument = {
        ...mockUserDocument,
        role: 'invalid-role',
      };

      expect(() => new UsersDocumentToEntityParser(invalidRoleDocument)).toThrow(
        ERRORS_MESSAGES.INVALID_USER_ROLE(invalidRoleDocument.role, invalidRoleDocument.id)
      );
    });

    it('should throw an error when role is empty string', () => {
      const emptyRoleDocument: UserDocument = {
        ...mockUserDocument,
        role: '',
      };

      expect(() => new UsersDocumentToEntityParser(emptyRoleDocument)).toThrow(
        ERRORS_MESSAGES.INVALID_USER_ROLE(emptyRoleDocument.role, emptyRoleDocument.id)
      );
    });

    it('should throw an error when role is undefined', () => {
      const undefinedRoleDocument: UserDocument = {
        ...mockUserDocument,
        role: undefined as any,
      };

      expect(() => new UsersDocumentToEntityParser(undefinedRoleDocument)).toThrow(
        ERRORS_MESSAGES.INVALID_USER_ROLE(undefinedRoleDocument.role, undefinedRoleDocument.id)
      );
    });

    it('should throw an error when role is null', () => {
      const nullRoleDocument: UserDocument = {
        ...mockUserDocument,
        role: null as any,
      };

      expect(() => new UsersDocumentToEntityParser(nullRoleDocument)).toThrow(
        ERRORS_MESSAGES.INVALID_USER_ROLE(nullRoleDocument.role, nullRoleDocument.id)
      );
    });

    it('should throw an error with correct message format including document id and role', () => {
      const invalidRoleDocument: UserDocument = {
        id: 'specific-user-id',
        email: 'test@example.com',
        role: 'superadmin',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        new UsersDocumentToEntityParser(invalidRoleDocument);
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const errorMessage = (error as Error).message;
        expect(errorMessage).toContain('specific-user-id');
        expect(errorMessage).toContain('superadmin');
      }
    });

    it('should preserve all document properties when parsing', () => {
      const specificDocument: UserDocument = {
        id: 'unique-id-789',
        email: 'specific@example.com',
        role: 'admin',
        createdAt: new Date('2023-06-15T10:30:00.000Z'),
        updatedAt: new Date('2023-12-20T15:45:00.000Z'),
      };

      const parser = new UsersDocumentToEntityParser(specificDocument);

      expect(parser.id).toBe(specificDocument.id);
      expect(parser.email).toBe(specificDocument.email);
      expect(parser.role).toBe(UserRole.ADMIN);
      expect(parser.createdAt).toBe(specificDocument.createdAt);
      expect(parser.updatedAt).toBe(specificDocument.updatedAt);
    });
  });
});

