import { ExecutionLogger } from '@repo/shared/definitions';
import { FromSchema } from 'json-schema-to-ts';

import { AuthUser } from './auth.interfaces';
import { FASTIFY_ENV_SCHEMA } from '../constants/server.constants';


declare module 'fastify' {
  interface FastifyBaseLogger extends ExecutionLogger {} // added in the server.ts file
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    config: FromSchema<typeof FASTIFY_ENV_SCHEMA>; // added by plugin @fastify/env
    jwt: { // added by plugin @fastify/jwt
      sign: (payload: any) => Promise<string>;
    };
  }
  interface FastifyRequest {
    getEnvs: () => FromSchema<typeof FASTIFY_ENV_SCHEMA>;
    jwtVerify: () => Promise<void>; // added by plugin @fastify/jwt
    user: AuthUser;
  }
}
