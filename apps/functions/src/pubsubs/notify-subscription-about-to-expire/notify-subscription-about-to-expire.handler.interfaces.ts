import { IsNumber, IsString } from 'class-validator';

export class NotifySubscriptionAboutToExpirePubSubMessage {
  @IsString()
  companyId: string;

  @IsNumber()
  daysToExpire: number;

  constructor(message: { companyId: string; daysToExpire: number }) {
    Object.assign(this, message);
  }
}
