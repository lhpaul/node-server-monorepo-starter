import { TransactionType } from '@repo/shared/domain';

import { ProcessResource, ProcessStatus } from '../definitions';

export class TransactionUpdateRequest implements ProcessResource {
  public readonly amount?: number;
  public readonly createdAt: Date;
  public readonly date?: string;
  public readonly error: any;
  public readonly id: string;
  public readonly status: ProcessStatus;
  public readonly transactionId: string; // id of the transaction to update
  public readonly type?: TransactionType;
  public readonly updatedAt: Date;
  public readonly userId: string;

  constructor(transactionUpdateRequest: Required<TransactionUpdateRequest>) {
    Object.assign(this, transactionUpdateRequest);
  }
}