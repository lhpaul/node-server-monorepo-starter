import { FastifyInstance, RouteOptions } from 'fastify';

import { companiesEndpointsBuilder } from './endpoints/companies/companies.endpoints';
import { transactionsEndpointsBuilder } from './endpoints/transactions/transactions.endpoints';

export const routesBuilder = (server: FastifyInstance): RouteOptions[] => {
  return [
    ...companiesEndpointsBuilder(server),
    ...transactionsEndpointsBuilder(server),
  ];
};
