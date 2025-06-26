import { TransactionType } from '@repo/shared/domain';

import { RequestModel } from '../utils/models/request-model.classes';

export class TransactionUpdateRequest extends RequestModel {
  public readonly amount?: number;
  public readonly date?: string;
  public readonly transactionId: string; // id of the transaction to update
  public readonly type?: TransactionType;

  constructor(transactionUpdateRequest: Required<TransactionUpdateRequest>) {
    super();
    Object.assign(this, transactionUpdateRequest);
  }
}