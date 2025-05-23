import { FastifyInstance, RouteOptions } from 'fastify';

import { authEndpointsBuilder } from './endpoints/auth/auth.endpoints';
import { companiesEndpointsBuilder } from './endpoints/companies/companies.endpoints';

export const routesBuilder = (server: FastifyInstance): RouteOptions[] => {
  return [
    ...authEndpointsBuilder(server),
    ...companiesEndpointsBuilder(server)
  ];
};

