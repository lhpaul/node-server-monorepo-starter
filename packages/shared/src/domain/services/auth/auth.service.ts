import { compare } from 'bcrypt';

import { ExecutionLogger } from '../../../definitions';
import { User } from '../..';
import { UsersRepository } from '../../../repositories';
import { VALIDATE_CREDENTIALS_STEPS } from './auth.service.constants';
import { ValidateCredentialsInput } from './auth.service.interfaces';

export class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!this.instance) {
      this.instance = new AuthService();
    }
    return this.instance;
  }
  public async validateCredentials(
    input: ValidateCredentialsInput,
    logger: ExecutionLogger,
  ): Promise<User | null> {
    const logGroup = `${this.constructor.name}.${this.validateCredentials.name}`;
    logger.startStep(VALIDATE_CREDENTIALS_STEPS.FIND_USER, logGroup);
    const [user, ..._users] = await UsersRepository.getInstance().getDocumentsList({
      email: [{ operator: '==', value: input.email }],
    }, logger);
    logger.endStep(VALIDATE_CREDENTIALS_STEPS.FIND_USER);
    if (!user) {
      return null;
    }
    logger.startStep(VALIDATE_CREDENTIALS_STEPS.CHECK_PASSWORD, logGroup);
    const isPasswordValid = await compare(input.password, user.currentPasswordHash);
    logger.endStep(VALIDATE_CREDENTIALS_STEPS.CHECK_PASSWORD);
    // normally here we would do something to avoid brute force attacks
    if (!isPasswordValid) {
      return null;
    }
    return user;
  }

  
  
}