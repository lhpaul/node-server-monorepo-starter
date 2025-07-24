import { ResourceModel } from '../../definitions/domain.interfaces';

export class FinancialInstitution implements ResourceModel {
  public readonly id: string; // id of the financial institution
  public readonly name: string; // name of the financial institution
  public readonly createdAt: Date; // date of creation
  public readonly updatedAt: Date; // date of last update

  constructor(financialInstitution: Required<FinancialInstitution>) {
    Object.assign(this, financialInstitution);
  }
}