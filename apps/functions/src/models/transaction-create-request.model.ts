import { TransactionType } from '@repo/shared/domain';

import { RequestModel } from '../utils/models/request-model.class';

export class TransactionCreateRequest extends RequestModel {
  public readonly amount: number;
  public readonly date: string;
  public readonly transactionId: string | null; // id of the created transaction document
  public readonly type: TransactionType;

  constructor(transactionCreateRequest: Required<TransactionCreateRequest>) {
    super();
    Object.assign(this, transactionCreateRequest);
  }
}