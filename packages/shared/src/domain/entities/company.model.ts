import { EntityModel } from '../../definitions/domain.interfaces';

export class Company implements EntityModel {
  public readonly countryCode: string; // ISO 3166-1 alpha-2 country code (e.g., US, CA, MX)
  public readonly createdAt: Date; // date of creation
  public readonly id: string; // id of the company
  public readonly name: string; // name of the company
  public readonly updatedAt: Date; // date of last update
  constructor(company: Required<Company>) {
    Object.assign(this, company);
  }
}
