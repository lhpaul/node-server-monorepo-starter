import { Transaction } from './transaction.model';

export enum TransactionUpdateRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export class TransactionUpdateRequest {
  public readonly createdAt: Date;
  public readonly fieldsToUpdate: Partial<Transaction>;
  public readonly id: string;
  public readonly requesterMessage: string | null;
  public readonly requesterUserId: string;
  public readonly reviewMessage: string | null;
  public readonly reviewedAt: Date | null;
  public readonly reviewerUserId: string | null;
  public readonly status: TransactionUpdateRequestStatus;
  public readonly updatedAt: Date;
}