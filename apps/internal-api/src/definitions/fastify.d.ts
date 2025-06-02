import { ExecutionLogger } from '@repo/shared/definitions';

declare module 'fastify' {
  interface FastifyBaseLogger extends ExecutionLogger {}
  interface FastifyRequest {
    user?: any; // TODO: add client info
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  
}
