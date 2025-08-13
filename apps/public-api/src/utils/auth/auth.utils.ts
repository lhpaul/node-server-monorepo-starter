import { ExecutionLogger } from '@repo/shared/definitions';
import {
  CompaniesService,
  UserCompanyRelationsService,
  UserCompanyRole,
} from '@repo/shared/domain';

import { UserPermissions } from '../../definitions/auth.interfaces';
import { PERMISSIONS_BY_ROLE } from '../../constants/permissions.constants';
import { GET_USER_PERMISSIONS_STEPS, LOG_GROUP_NAME, PERMISSIONS_SUFFIXES } from './auth.utils.constants';

export async function getUserPermissions(userId: string, logger: ExecutionLogger): Promise<UserPermissions> {
  const logGroup = `${LOG_GROUP_NAME}.${getUserPermissions.name}`;
  logger.startStep(GET_USER_PERMISSIONS_STEPS.GET_USER_COMPANY_RELATIONS.id, logGroup);
  const userCompanyRelations = await UserCompanyRelationsService.getInstance().getUserCompanyRelations(userId, logger);
  logger.endStep(GET_USER_PERMISSIONS_STEPS.GET_USER_COMPANY_RELATIONS.id);
  const response: { companies: { [key: string]: string[] } } = { companies: {} };
  // get subscriptions of this companies
  logger.startStep(GET_USER_PERMISSIONS_STEPS.GET_SUBSCRIPTIONS.id, logGroup);
  const companySubscriptions = await Promise.all(userCompanyRelations.map(async (relation) => {
    const subscriptions = await CompaniesService.getInstance().getActiveSubscriptions(relation.companyId, logger);
    return subscriptions;
  }));
  logger.endStep(GET_USER_PERMISSIONS_STEPS.GET_SUBSCRIPTIONS.id);
  for (const index in userCompanyRelations) {
    const userCompanyRelation = userCompanyRelations[index];
    const subscriptions = companySubscriptions[index];
    response.companies[userCompanyRelation.companyId] = PERMISSIONS_BY_ROLE[userCompanyRelation.role as UserCompanyRole];
    if (!subscriptions.length) { // if no subscription, replace write permissions with read permissions
      response.companies[userCompanyRelation.companyId] = response.companies[userCompanyRelation.companyId].map((permission) => permission.replace(PERMISSIONS_SUFFIXES.WRITE, PERMISSIONS_SUFFIXES.READ));
    }
  }
  return response;
}
