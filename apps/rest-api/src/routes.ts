import { RouteOptions } from 'fastify';

import { transactionsEndpointsBuilder } from './endpoints/transactions/transactions.endpoints';

export const routes: RouteOptions[] = [...transactionsEndpointsBuilder()];
