import { ExecutionLogger } from '@repo/shared/definitions';
import { FromSchema } from 'json-schema-to-ts';

import { AuthUser } from './auth.interfaces';
import { FASTIFY_ENV_SCHEMA } from '../constants/server.constants';


declare module 'fastify' {
  interface FastifyBaseLogger extends ExecutionLogger {} // added in the server.ts file
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    config: FromSchema<typeof FASTIFY_ENV_SCHEMA>; // added by plugin @fastify/env
  }
  interface FastifyRequest {
    getEnvs: () => FromSchema<typeof FASTIFY_ENV_SCHEMA>;
    user: AuthUser;
  }
}
