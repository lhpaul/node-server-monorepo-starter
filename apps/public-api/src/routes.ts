import { RouteOptions } from 'fastify';

import { companiesEndpointsBuilder } from './endpoints/companies/companies.endpoints';
import { transactionsEndpointsBuilder } from './endpoints/transactions/transactions.endpoints';

export const routes: RouteOptions[] = [
  ...companiesEndpointsBuilder(),
  ...transactionsEndpointsBuilder(),
];
