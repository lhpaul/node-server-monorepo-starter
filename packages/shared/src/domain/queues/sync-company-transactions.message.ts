import { IsString } from 'class-validator';

export class SyncCompanyTransactionsMessage {
  @IsString()
  public readonly companyId: string; // id of the company

  @IsString()
  public readonly fromDate: string; // from date

  @IsString()
  public readonly toDate: string; // to date

  constructor(message: Required<SyncCompanyTransactionsMessage>) {
    Object.assign(this, message);
  }
}