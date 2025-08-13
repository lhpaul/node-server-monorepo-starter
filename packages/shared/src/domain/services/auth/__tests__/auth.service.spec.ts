// Internal modules (farthest path first, then alphabetical)
import { compare } from 'bcrypt';

// Local imports (alphabetical)
import { UsersRepository } from '../../../../repositories';
import { VALIDATE_CREDENTIALS_STEPS } from '../auth.service.constants';
import { ValidateCredentialsInput } from '../auth.service.interfaces';
import { AuthService } from '../auth.service';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

// Mock the entire repositories module
jest.mock('../../../../repositories', () => ({
  UsersRepository: {
    getInstance: jest.fn(),
  },
}));

describe(AuthService.name, () => {
  let authService: AuthService;
  let mockUsersRepository: any;
  let mockLogger: any;
  let mockUser: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock logger
    mockLogger = {
      startStep: jest.fn(),
      endStep: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      fatal: jest.fn(),
      lastStep: { id: '', group: '' },
      stepsCounter: 0,
      initTime: Date.now(),
      getStepElapsedTime: jest.fn(),
      getTotalElapsedTime: jest.fn(),
    };

    // Create mock user
    mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      currentPasswordHash: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create mock repository
    mockUsersRepository = {
      getDocumentsList: jest.fn(),
    };

    (UsersRepository.getInstance as jest.Mock).mockReturnValue(mockUsersRepository);

    // Get singleton instance
    authService = AuthService.getInstance();
  });

  describe(AuthService.getInstance.name, () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = AuthService.getInstance();
      const instance2 = AuthService.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBe(authService);
    });

    it('should create a new instance only on first call', () => {
      // Clear any existing instance by accessing the private property
      (AuthService as any).instance = undefined;
      
      const instance1 = AuthService.getInstance();
      const instance2 = AuthService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe(AuthService.prototype.validateCredentials.name, () => {
    const validInput: ValidateCredentialsInput = {
      email: 'test@example.com',
      password: 'password123',
    };

    const logGroup = `${AuthService.name}.validateCredentials`;

    it('should validate credentials successfully with valid input', async () => {
      // Setup mocks
      mockUsersRepository.getDocumentsList.mockResolvedValue([mockUser]);
      (compare as jest.Mock).mockResolvedValue(true);

      // Execute
      const result = await authService.validateCredentials(validInput, mockLogger);

      // Assert
      expect(result).toBe(mockUser);
      expect(mockUsersRepository.getDocumentsList).toHaveBeenCalledWith({
        email: [{ operator: '==', value: validInput.email }],
      }, mockLogger);
      expect(compare).toHaveBeenCalledWith(validInput.password, mockUser.currentPasswordHash);
      expect(mockLogger.startStep).toHaveBeenCalledWith(VALIDATE_CREDENTIALS_STEPS.FIND_USER, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(VALIDATE_CREDENTIALS_STEPS.FIND_USER);
      expect(mockLogger.startStep).toHaveBeenCalledWith(VALIDATE_CREDENTIALS_STEPS.CHECK_PASSWORD, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(VALIDATE_CREDENTIALS_STEPS.CHECK_PASSWORD);
    });

    it('should return null when user is not found', async () => {
      // Setup mocks
      mockUsersRepository.getDocumentsList.mockResolvedValue([]);

      // Execute
      const result = await authService.validateCredentials(validInput, mockLogger);

      // Assert
      expect(result).toBeNull();
      expect(mockUsersRepository.getDocumentsList).toHaveBeenCalledWith({
        email: [{ operator: '==', value: validInput.email }],
      }, mockLogger);
      expect(compare).not.toHaveBeenCalled();
      expect(mockLogger.startStep).toHaveBeenCalledWith(VALIDATE_CREDENTIALS_STEPS.FIND_USER, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(VALIDATE_CREDENTIALS_STEPS.FIND_USER);
      expect(mockLogger.startStep).not.toHaveBeenCalledWith(VALIDATE_CREDENTIALS_STEPS.CHECK_PASSWORD, logGroup);
      expect(mockLogger.endStep).not.toHaveBeenCalledWith(VALIDATE_CREDENTIALS_STEPS.CHECK_PASSWORD);
    });

    it('should return null when password is invalid', async () => {
      // Setup mocks
      mockUsersRepository.getDocumentsList.mockResolvedValue([mockUser]);
      (compare as jest.Mock).mockResolvedValue(false);

      // Execute
      const result = await authService.validateCredentials(validInput, mockLogger);

      // Assert
      expect(result).toBeNull();
      expect(mockUsersRepository.getDocumentsList).toHaveBeenCalledWith({
        email: [{ operator: '==', value: validInput.email }],
      }, mockLogger);
      expect(compare).toHaveBeenCalledWith(validInput.password, mockUser.currentPasswordHash);
      expect(mockLogger.startStep).toHaveBeenCalledWith(VALIDATE_CREDENTIALS_STEPS.FIND_USER, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(VALIDATE_CREDENTIALS_STEPS.FIND_USER);
      expect(mockLogger.startStep).toHaveBeenCalledWith(VALIDATE_CREDENTIALS_STEPS.CHECK_PASSWORD, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(VALIDATE_CREDENTIALS_STEPS.CHECK_PASSWORD);
    });

    it('should handle multiple users returned and use the first one', async () => {
      // Setup mocks
      const mockUser2 = { ...mockUser, id: 'user-456' };
      mockUsersRepository.getDocumentsList.mockResolvedValue([mockUser, mockUser2]);
      (compare as jest.Mock).mockResolvedValue(true);

      // Execute
      const result = await authService.validateCredentials(validInput, mockLogger);

      // Assert
      expect(result).toBe(mockUser);
      expect(compare).toHaveBeenCalledWith(validInput.password, mockUser.currentPasswordHash);
    });

    it('should handle repository errors gracefully', async () => {
      // Setup mocks
      const repositoryError = new Error('Database connection failed');
      mockUsersRepository.getDocumentsList.mockRejectedValue(repositoryError);

      // Execute and assert
      await expect(authService.validateCredentials(validInput, mockLogger)).rejects.toThrow(repositoryError);
      expect(mockLogger.startStep).toHaveBeenCalledWith(VALIDATE_CREDENTIALS_STEPS.FIND_USER, logGroup);
      expect(mockLogger.endStep).not.toHaveBeenCalledWith(VALIDATE_CREDENTIALS_STEPS.FIND_USER);
    });

    it('should handle bcrypt compare errors gracefully', async () => {
      // Setup mocks
      mockUsersRepository.getDocumentsList.mockResolvedValue([mockUser]);
      const bcryptError = new Error('Bcrypt comparison failed');
      (compare as jest.Mock).mockRejectedValue(bcryptError);

      // Execute and assert
      await expect(authService.validateCredentials(validInput, mockLogger)).rejects.toThrow(bcryptError);
      expect(mockLogger.startStep).toHaveBeenCalledWith(VALIDATE_CREDENTIALS_STEPS.FIND_USER, logGroup);
      expect(mockLogger.endStep).toHaveBeenCalledWith(VALIDATE_CREDENTIALS_STEPS.FIND_USER);
      expect(mockLogger.startStep).toHaveBeenCalledWith(VALIDATE_CREDENTIALS_STEPS.CHECK_PASSWORD, logGroup);
      expect(mockLogger.endStep).not.toHaveBeenCalledWith(VALIDATE_CREDENTIALS_STEPS.CHECK_PASSWORD);
    });

    it('should handle empty email input', async () => {
      const inputWithEmptyEmail: ValidateCredentialsInput = {
        email: '',
        password: 'password123',
      };

      // Setup mocks
      mockUsersRepository.getDocumentsList.mockResolvedValue([]);

      // Execute
      const result = await authService.validateCredentials(inputWithEmptyEmail, mockLogger);

      // Assert
      expect(result).toBeNull();
      expect(mockUsersRepository.getDocumentsList).toHaveBeenCalledWith({
        email: [{ operator: '==', value: '' }],
      }, mockLogger);
    });

    it('should handle empty password input', async () => {
      const inputWithEmptyPassword: ValidateCredentialsInput = {
        email: 'test@example.com',
        password: '',
      };

      // Setup mocks
      mockUsersRepository.getDocumentsList.mockResolvedValue([mockUser]);
      (compare as jest.Mock).mockResolvedValue(false);

      // Execute
      const result = await authService.validateCredentials(inputWithEmptyPassword, mockLogger);

      // Assert
      expect(result).toBeNull();
      expect(compare).toHaveBeenCalledWith('', mockUser.currentPasswordHash);
    });

    it('should handle special characters in email and password', async () => {
      const inputWithSpecialChars: ValidateCredentialsInput = {
        email: 'test+user@example.com',
        password: 'p@ssw0rd!@#$%^&*()',
      };

      // Setup mocks
      mockUsersRepository.getDocumentsList.mockResolvedValue([mockUser]);
      (compare as jest.Mock).mockResolvedValue(true);

      // Execute
      const result = await authService.validateCredentials(inputWithSpecialChars, mockLogger);

      // Assert
      expect(result).toBe(mockUser);
      expect(mockUsersRepository.getDocumentsList).toHaveBeenCalledWith({
        email: [{ operator: '==', value: 'test+user@example.com' }],
      }, mockLogger);
      expect(compare).toHaveBeenCalledWith('p@ssw0rd!@#$%^&*()', mockUser.currentPasswordHash);
    });

    it('should handle unicode characters in email and password', async () => {
      const inputWithUnicode: ValidateCredentialsInput = {
        email: 'tëst@exämple.com',
        password: 'pässwörd🚀',
      };

      // Setup mocks
      mockUsersRepository.getDocumentsList.mockResolvedValue([mockUser]);
      (compare as jest.Mock).mockResolvedValue(true);

      // Execute
      const result = await authService.validateCredentials(inputWithUnicode, mockLogger);

      // Assert
      expect(result).toBe(mockUser);
      expect(mockUsersRepository.getDocumentsList).toHaveBeenCalledWith({
        email: [{ operator: '==', value: 'tëst@exämple.com' }],
      }, mockLogger);
      expect(compare).toHaveBeenCalledWith('pässwörd🚀', mockUser.currentPasswordHash);
    });

    it('should log steps in correct order', async () => {
      // Setup mocks
      mockUsersRepository.getDocumentsList.mockResolvedValue([mockUser]);
      (compare as jest.Mock).mockResolvedValue(true);

      // Execute
      await authService.validateCredentials(validInput, mockLogger);

      // Assert logging order
      expect(mockLogger.startStep).toHaveBeenNthCalledWith(1, VALIDATE_CREDENTIALS_STEPS.FIND_USER, logGroup);
      expect(mockLogger.endStep).toHaveBeenNthCalledWith(1, VALIDATE_CREDENTIALS_STEPS.FIND_USER);
      expect(mockLogger.startStep).toHaveBeenNthCalledWith(2, VALIDATE_CREDENTIALS_STEPS.CHECK_PASSWORD, logGroup);
      expect(mockLogger.endStep).toHaveBeenNthCalledWith(2, VALIDATE_CREDENTIALS_STEPS.CHECK_PASSWORD);
    });

    it('should handle user with null currentPasswordHash', async () => {
      // Setup mocks
      const userWithoutPassword = { ...mockUser, currentPasswordHash: null };
      mockUsersRepository.getDocumentsList.mockResolvedValue([userWithoutPassword]);
      (compare as jest.Mock).mockResolvedValue(false);

      // Execute
      const result = await authService.validateCredentials(validInput, mockLogger);

      // Assert
      expect(result).toBeNull();
      expect(compare).toHaveBeenCalledWith(validInput.password, null);
    });

    it('should handle user with undefined currentPasswordHash', async () => {
      // Setup mocks
      const userWithoutPassword = { ...mockUser, currentPasswordHash: undefined };
      mockUsersRepository.getDocumentsList.mockResolvedValue([userWithoutPassword]);
      (compare as jest.Mock).mockResolvedValue(false);

      // Execute
      const result = await authService.validateCredentials(validInput, mockLogger);

      // Assert
      expect(result).toBeNull();
      expect(compare).toHaveBeenCalledWith(validInput.password, undefined);
    });
  });
});
