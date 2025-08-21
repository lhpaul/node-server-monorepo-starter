import { FastifyInstance, RouteOptions } from 'fastify';

import { companiesEndpointsBuilder } from './endpoints/companies/companies.endpoints';
import { financialInstitutionsEndpointsBuilder } from './endpoints/financial-institutions/financial-institutions.endpoints';
import { subscriptionsEndpointsBuilder } from './endpoints/subscriptions/subscriptions.endpoints';
import { transactionCategoriesEndpointsBuilder } from './endpoints/transaction-categories/transaction-categories.endpoints';
import { transactionsEndpointsBuilder } from './endpoints/transactions/transactions.endpoints';
import { usersEndpointsBuilder } from './endpoints/users/users.endpoints';

export const routesBuilder = (server: FastifyInstance): RouteOptions[] => {
  return [
    ...companiesEndpointsBuilder(server),
    ...financialInstitutionsEndpointsBuilder(server),
    ...subscriptionsEndpointsBuilder(server),
    ...transactionCategoriesEndpointsBuilder(server),
    ...transactionsEndpointsBuilder(server),
    ...usersEndpointsBuilder(server),
  ];
};
