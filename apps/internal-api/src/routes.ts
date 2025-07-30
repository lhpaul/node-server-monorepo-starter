import { FastifyInstance, RouteOptions } from 'fastify';

import { companiesEndpointsBuilder } from './endpoints/companies/companies.endpoints';
import { subscriptionsEndpointsBuilder } from './endpoints/subscriptions/subscriptions.endpoints';
import { transactionCategoriesEndpointsBuilder } from './endpoints/transaction-categories/transaction-categories.endpoints';
import { transactionsEndpointsBuilder } from './endpoints/transactions/transactions.endpoints';

export const routesBuilder = (server: FastifyInstance): RouteOptions[] => {
  return [
    ...companiesEndpointsBuilder(server),
    ...subscriptionsEndpointsBuilder(server),
    ...transactionCategoriesEndpointsBuilder(server),
    ...transactionsEndpointsBuilder(server),
  ];
};
