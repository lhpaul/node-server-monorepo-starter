import { ResourceModel } from '../../definitions/domain.interfaces';

export class FinancialInstitution implements ResourceModel {
  public readonly countryCode: string; // ISO 3166-1 alpha-2 country code (e.g., US, CA, MX)
  public readonly createdAt: Date; // date of creation
  public readonly id: string; // id of the financial institution
  public readonly name: string; // name of the financial institution
  public readonly updatedAt: Date; // date of last update

  constructor(financialInstitution: Required<FinancialInstitution>) {
    Object.assign(this, financialInstitution);
  }
}