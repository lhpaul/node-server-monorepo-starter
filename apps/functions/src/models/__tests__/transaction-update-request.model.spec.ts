import { TransactionType } from '@repo/shared/domain';

import { ProcessStatus } from '../../definitions/models.interfaces';
import { TransactionUpdateRequest } from '../transaction-update-request.model';

describe(TransactionUpdateRequest.name, () => {
  const initialValues = {
    amount: 150,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    date: '2024-01-01',
    error: null,
    id: 'tur-001',
    status: ProcessStatus.PENDING,
    transactionId: 'txn-001',
    type: TransactionType.CREDIT,
    updatedAt: new Date('2024-01-02T00:00:00Z'),
  };
  let request: TransactionUpdateRequest;

  beforeEach(() => {
    request = new TransactionUpdateRequest(initialValues as Required<TransactionUpdateRequest>);
  });

  it('should create a new TransactionUpdateRequest instance', () => {
    expect(request).toBeInstanceOf(TransactionUpdateRequest);
  });

  it('should assign all properties correctly', () => {
    expect(request.amount).toBe(initialValues.amount);
    expect(request.createdAt).toEqual(initialValues.createdAt);
    expect(request.date).toBe(initialValues.date);
    expect(request.error).toBe(initialValues.error);
    expect(request.id).toBe(initialValues.id);
    expect(request.status).toBe(initialValues.status);
    expect(request.transactionId).toBe(initialValues.transactionId);
    expect(request.type).toBe(initialValues.type);
    expect(request.updatedAt).toEqual(initialValues.updatedAt);
  });
}); 