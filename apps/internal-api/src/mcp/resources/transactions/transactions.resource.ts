import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { RequestLogger } from '@repo/fastify';
import { QueryItem } from '@repo/shared/definitions';
import { TransactionsService } from '@repo/shared/services';
import { FastifyBaseLogger } from 'fastify';

import { McpResourceConfig } from '../../../definitions/mcp.interfaces';
import { RESOURCE_NAME, RESOURCE_PATH, STEPS } from './transactions.resource.constants';

export function transactionsResourceBuilder(serverLogger: FastifyBaseLogger): McpResourceConfig {
  return {
    name: RESOURCE_NAME,
    template: new ResourceTemplate(RESOURCE_PATH, {
      list: undefined,
    }),
    handler: async (uri, variables, extra) => {
      const { companyId, dateFrom, dateTo } = variables;

      // TODO: validate variables format

      const requestLogger = new RequestLogger({ logger: serverLogger })
      .child({ requestId: extra.requestId, resource: RESOURCE_NAME, uri, variables });

      requestLogger.startStep(STEPS.GET_TRANSACTIONS.id);
      const dateFilters: QueryItem<string>[] = [];
      if (dateFrom) {
        dateFilters.push({ value: dateFrom as string, operator: '>=' });
      }
      if (dateTo) {
        dateFilters.push({ value: dateTo as string, operator: '<=' });
      }
      const service = TransactionsService.getInstance();
      const transactions = await service.getResourcesList({
        companyId: [{ value: companyId, operator: '==' }],
        date: dateFilters,
      }, requestLogger)
      .finally(() => requestLogger.endStep(STEPS.GET_TRANSACTIONS.id));
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(transactions),
          mimeType: 'application/json',
        }]
      };
    },
  };
}
