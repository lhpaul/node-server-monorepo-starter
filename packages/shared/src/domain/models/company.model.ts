import { DatabaseObject } from '../../definitions/database.interfaces';

export class Company implements DatabaseObject {
  public readonly createdAt: Date; // date of creation
  public readonly id: string; // id of the company
  public readonly name: string; // name of the company
  public readonly updatedAt: Date; // date of last update
  constructor(company: Required<Company>) {
    Object.assign(this, company);
  }
}
