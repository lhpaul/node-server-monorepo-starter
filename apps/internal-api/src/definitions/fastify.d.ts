import { ExecutionLogger } from '@repo/shared/definitions';

declare module 'fastify' {
  interface FastifyBaseLogger extends ExecutionLogger {}

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  
}
