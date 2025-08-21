import { FastifyInstance, RouteOptions } from 'fastify';

import { authEndpointsBuilder } from './endpoints/auth/auth.endpoints';
import { companiesEndpointsBuilder } from './endpoints/companies/companies.endpoints';
import { financialInstitutionsEndpointsBuilder } from './endpoints/financial-institutions/financial-institutions.endpoints';
import { transactionCategoriesEndpointsBuilder } from './endpoints/transaction-categories/transaction-categories.endpoints';

export const routesBuilder = (server: FastifyInstance): RouteOptions[] => {
  return [
    ...authEndpointsBuilder(server),
    ...companiesEndpointsBuilder(server),
    ...financialInstitutionsEndpointsBuilder(server),
    ...transactionCategoriesEndpointsBuilder(server)
  ];
};

