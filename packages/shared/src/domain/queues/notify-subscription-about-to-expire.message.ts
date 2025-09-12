import { IsNumber, IsString } from 'class-validator';

export class NotifySubscriptionAboutToExpireMessage {
  @IsString()
  public readonly companyId: string; // id of the company

  @IsNumber()
  public readonly daysToExpire: number; // number of days to expire

  constructor(message: Required<NotifySubscriptionAboutToExpireMessage>) {
    Object.assign(this, message);
  }
}