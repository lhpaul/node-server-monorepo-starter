import { STATUS_CODES } from '@repo/fastify';
import { CompaniesRepository } from '@repo/shared/repositories';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthUser } from '../../../../definitions/auth.interfaces';
import { STEPS } from './companies.list.constants';

export const listCompaniesHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const logger = request.log.child({ handler: listCompaniesHandler.name });
  const repository = CompaniesRepository.getInstance();
  const user = request.user as AuthUser;

  // Get all company IDs the user has permission for
  if (!user.companies) {
    return reply.code(STATUS_CODES.OK).send([]);
  }
  const companyIds = Object.keys(user.companies);
  
  // Get company information for each ID in parallel
  logger.startStep(STEPS.GET_COMPANIES.id);
  const companies = await Promise.all(
    companyIds.map((id) => repository.getDocument(id, logger)),
  ).finally(() => logger.endStep(STEPS.GET_COMPANIES.id));

  // Filter out any null values (though this shouldn't happen if permissions are correct)
  const validCompanies = companies.filter((company): company is NonNullable<typeof company> => 
    company !== null
  );
  return reply.code(STATUS_CODES.OK).send(validCompanies);
};
