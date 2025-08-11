import { EntityModel } from '../../definitions/domain.interfaces';

export class CompanyFinancialInstitutionRelation implements EntityModel {
  public readonly companyId: string; // id of the company
  public readonly createdAt: Date; // date of creation
  public readonly encryptedCredentials: string; // encrypted credentials of the company for the financial institution
  public readonly financialInstitutionId: string; // id of the financial institution
  public readonly id: string; // id of the relation
  public readonly updatedAt: Date; // date of last update

  constructor(data: Required<CompanyFinancialInstitutionRelation>) {
    this.companyId = data.companyId;
    this.createdAt = data.createdAt;
    this.encryptedCredentials = data.encryptedCredentials;
    this.financialInstitutionId = data.financialInstitutionId;
    this.id = data.id;
    this.updatedAt = data.updatedAt;
  }
}