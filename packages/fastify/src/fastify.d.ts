import { ExecutionLogger } from '@repo/shared/definitions';

declare module 'fastify' {
  interface FastifyBaseLogger extends ExecutionLogger {}
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
