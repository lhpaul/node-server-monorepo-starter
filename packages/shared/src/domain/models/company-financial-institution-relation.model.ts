import { ResourceModel } from '../../definitions/domain.interfaces';

export class CompanyFinancialInstitutionRelation implements ResourceModel {
  public readonly companyId: string; // id of the company
  public readonly createdAt: Date; // date of creation
  public readonly encryptedCredentials: string; // encrypted credentials of the company for the financial institution
  public readonly financialInstitutionId: string; // id of the financial institution
  public readonly id: string; // id of the relation
  public readonly updatedAt: Date; // date of last update

  constructor(companyFinancialInstitutionRelation: Required<CompanyFinancialInstitutionRelation>) {
    Object.assign(this, companyFinancialInstitutionRelation);
  }
}