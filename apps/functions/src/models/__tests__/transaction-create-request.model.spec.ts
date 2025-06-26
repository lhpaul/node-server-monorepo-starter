import { TransactionType } from '@repo/shared/domain';

import { ProcessStatus } from '../../definitions/models.interfaces';
import { TransactionCreateRequest } from '../transaction-create-request.model';

describe(TransactionCreateRequest.name, () => {
  const initialValues = {
    amount: 150,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    date: '2024-01-01',
    error: null,
    id: 'tcr-001',
    status: ProcessStatus.PENDING,
    transactionId: null,
    type: TransactionType.CREDIT,
    updatedAt: new Date('2024-01-02T00:00:00Z'),
  };
  let request: TransactionCreateRequest;

  beforeEach(() => {
    request = new TransactionCreateRequest(initialValues as Required<TransactionCreateRequest>);
  });

  it('should create a new TransactionCreateRequest instance', () => {
    expect(request).toBeInstanceOf(TransactionCreateRequest);
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