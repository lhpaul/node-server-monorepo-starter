import { ExecutionLogger } from '@repo/shared/definitions';

declare module 'fastify' {
  interface FastifyBaseLogger extends ExecutionLogger {}
}
