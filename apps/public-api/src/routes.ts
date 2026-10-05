import { FastifyInstance, RouteOptions } from 'fastify';

import { examplesEndpointsBuilder } from './endpoints/examples/examples.endpoints';

export const routesBuilder = (server: FastifyInstance): RouteOptions[] => {
  return [
    ...examplesEndpointsBuilder(server),
  ];
};

