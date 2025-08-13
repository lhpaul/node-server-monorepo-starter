import { EntityModel } from '../../definitions/domain.interfaces';

export class Subscription implements EntityModel {
  public readonly companyId: string; // id of the company
  public readonly createdAt: Date; // date of creation
  public readonly endsAt: Date; // end date of the subscription
  public readonly id: string; // id of the subscription
  public readonly startsAt: Date; // start date of the subscription
  public readonly updatedAt: Date; // date of last update
  constructor(data: Required<Subscription>) {
    this.companyId = data.companyId;
    this.createdAt = data.createdAt;
    this.endsAt = data.endsAt;
    this.id = data.id;
    this.startsAt = data.startsAt;
    this.updatedAt = data.updatedAt;
  }
}