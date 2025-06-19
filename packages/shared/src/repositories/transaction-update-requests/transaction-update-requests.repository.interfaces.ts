import { DocumentModel, QueryInput, QueryItem } from '../../definitions/repositories.interfaces';
import { TransactionUpdateRequestStatus } from '../../domain/models/transaction-update-request.model';

export interface TransactionUpdateRequestDocument extends DocumentModel {
  fieldsToUpdate: Record<string, any>;
  requesterMessage: string | null;
  requesterUserId: string;
  reviewMessage: string | null;
  reviewedAt: Date | null;
  reviewerUserId: string | null;
  status: TransactionUpdateRequestStatus;
}

export interface CreateTransactionUpdateRequestDocumentInput {
  fieldsToUpdate: Record<string, any>;
  requesterMessage: string | null;
  requesterUserId: string;
  reviewMessage: string | null;
  reviewedAt: Date | null;
  reviewerUserId: string | null;
  status: TransactionUpdateRequestStatus;
}

export interface UpdateTransactionUpdateRequestDocumentInput {
  fieldsToUpdate?: Record<string, any>;
  requesterMessage?: string | null;
  requesterUserId?: string;
  reviewMessage?: string | null;
  reviewedAt?: Date | null;
  reviewerUserId?: string | null;
  status?: TransactionUpdateRequestStatus;
}

export interface QueryTransactionUpdateRequestsInput extends QueryInput {
  fieldsToUpdate?: QueryItem<Record<string, any>>[];
  requesterMessage?: QueryItem<string>[];
  requesterUserId?: QueryItem<string>[];
  reviewMessage?: QueryItem<string>[];
  reviewedAt?: QueryItem<Date>[];
  reviewerUserId?: QueryItem<string>[];
  status?: QueryItem<TransactionUpdateRequestStatus>[];
} 