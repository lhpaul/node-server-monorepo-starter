import { EntityModel } from '../../definitions/domain.interfaces';

export class Subscription implements EntityModel {
  public readonly companyId: string; // id of the company
  public readonly createdAt: Date; // date of creation
  public readonly endsAt: Date; // end date of the subscription
  public readonly id: string; // id of the subscription
  public readonly startsAt: Date; // start date of the subscription
  public readonly updatedAt: Date; // date of last update
  constructor(subscription: Required<Subscription>) {
    Object.assign(this, subscription);
  }
}