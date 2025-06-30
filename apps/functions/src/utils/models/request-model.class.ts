import { ProcessStatus } from '../../definitions';

export class RequestModel {
  public readonly createdAt: Date;
  public readonly error: any;
  public readonly id: string;
  public readonly status: ProcessStatus;
  public readonly updatedAt: Date;
  public readonly userId: string;
}