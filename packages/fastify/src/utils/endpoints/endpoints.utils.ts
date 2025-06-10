import { FilterInput, FilterOperator } from '@repo/shared/definitions';
import { maskFields } from '@repo/shared/utils';
import {
  FastifyRequest,
  FastifyReply,
  RouteOptions,
  FastifyInstance,
} from 'fastify';

import {
  QUERY_PARAMS_OPERATORS,
  QUERY_PARAMS_OPERATORS_MAP,
} from '../../constants/requests.constants';
import { DEFAULT_ON_PRE_VALIDATION_HEADERS_TO_MASK, LOG_IDS } from './endpoints.utils.constants';
import { EndpointOptions } from './endpoints.utils.interfaces';

export function createEndpoint(
  server: FastifyInstance,
  values: RouteOptions,
  options?: EndpointOptions,
): RouteOptions {
  const { preValidation, onSend, ...rest } = values;
  const authenticate = options?.authenticate ?? true;
  return {
    preHandler: authenticate ? [server.authenticate] : [],
    ...rest,
    preValidation: function (
      this: FastifyInstance,
      request: FastifyRequest,
      reply: FastifyReply,
      done: () => void,
    ) {
      _logPreValidation(request, options);
      if (Array.isArray(preValidation)) {
        preValidation.forEach((handler) =>
          handler.call(this, request, reply, done),
        );
      } else if (preValidation) {
        preValidation.call(this, request, reply, done);
      }
      done();
    },
    onSend: function (
      this: FastifyInstance,
      request: FastifyRequest,
      reply: FastifyReply,
      payload: any,
      next: () => void,
    ) {
      _logOnSend(request, reply, payload, options);
      if (Array.isArray(onSend)) {
        onSend.forEach((handler) =>
          handler.call(this, request, reply, payload, next),
        );
      } else if (onSend) {
        onSend.call(this, request, reply, payload, next);
      }
      next();
    },
  };
}

export function transformQueryParams(queryParams: any): FilterInput {
  const query: FilterInput = {};
  for (const key in queryParams) {
    const [attribute, other] = key.split('[');
    let queryOperator = other?.split(']')[0];
    const operator: FilterOperator = queryOperator
      ? QUERY_PARAMS_OPERATORS_MAP[queryOperator as QUERY_PARAMS_OPERATORS]
      : '==';
    const value = queryParams[key] as any;
    if (query[attribute]) {
      query[attribute].push({ value, operator });
    } else {
      query[attribute] = [{ value, operator }];
    }
  }
  return query;
}

export function buildSchemaForQueryParamsProperty(
  field: string,
  type: string,
  operators: QUERY_PARAMS_OPERATORS[],
): Record<string, any> {
  const schema: Record<string, any> = {};
  for (const operator of operators) {
    if (operator === 'eq') {
      schema[field] = { type };
      continue;
    }
    schema[`${field}[${operator}]`] = { type };
  }
  return schema;
}

function _logPreValidation(request: FastifyRequest, options?: EndpointOptions) {
  const maskOptions = {
    params: [],
    query: [],
    requestPayloadFields: [],
    requestHeaders: DEFAULT_ON_PRE_VALIDATION_HEADERS_TO_MASK,
    ...options?.maskOptions,
  };
  request.log.info(
    {
      id: LOG_IDS.PRE_VALIDATION,
      data: {
        method: request.method,
        url: request.url,
        params: maskFields(
          request.params as Record<string, string>,
          maskOptions.params,
        ),
        query: maskFields(
          request.query as Record<string, string>,
          maskOptions.query,
        ),
        body: maskFields(
          request.body as Record<string, unknown>,
          maskOptions.requestPayloadFields,
        ),
        headers: maskFields(
          request.headers as Record<string, string>,
          maskOptions.requestHeaders,
        ),
      },
    },
    `On Request: ${request.method.toUpperCase()} ${request.url}`,
  );
}

function _logOnSend(
  request: FastifyRequest,
  reply: FastifyReply,
  payload: any,
  options?: EndpointOptions,
) {
  const maskOptions = {
    responseHeaders: [],
    responsePayloadFields: [],
    ...options?.maskOptions,
  };
  request.log.info(
    {
      id: LOG_IDS.ON_SEND,
      data: {
        responseTime: reply.elapsedTime,
        statusCode: reply.statusCode,
        responseHeaders: maskFields(
          reply.getHeaders() as Record<string, string>,
          maskOptions.responseHeaders,
        ),
        responsePayload: payload ? maskFields(JSON.parse(payload), maskOptions.responsePayloadFields) : undefined,
      },
    },
    `On Send: statusCode: ${reply.statusCode} responseTime: ${reply.elapsedTime}ms`,
  );
}
