import { validateSync } from 'class-validator';

import { SyncCompanyTransactionsMessage } from '../sync-company-transactions.message';

describe(SyncCompanyTransactionsMessage.name, () => {
  const validMessage = {
    companyId: 'company-123',
    fromDate: '2024-01-01',
    toDate: '2024-01-31',
  };

  it('should create a valid message instance', () => {
    const message = new SyncCompanyTransactionsMessage(validMessage);
    const errors = validateSync(message);
    
    expect(errors).toHaveLength(0);
    expect(message).toBeInstanceOf(SyncCompanyTransactionsMessage);
    expect(message.companyId).toBe(validMessage.companyId);
    expect(message.fromDate).toBe(validMessage.fromDate);
    expect(message.toDate).toBe(validMessage.toDate);
  });

  it('should validate property types', () => {
    // Test invalid companyId type
    const invalidCompanyIdMessage = new SyncCompanyTransactionsMessage({
      companyId: 123 as any,
      fromDate: '2024-01-01',
      toDate: '2024-01-31',
    });
    const companyIdErrors = validateSync(invalidCompanyIdMessage);
    expect(companyIdErrors).toHaveLength(1);
    expect(companyIdErrors[0].property).toBe('companyId');

    // Test invalid fromDate type
    const invalidFromDateMessage = new SyncCompanyTransactionsMessage({
      companyId: 'company-123',
      fromDate: 20240101 as any,
      toDate: '2024-01-31',
    });
    const fromDateErrors = validateSync(invalidFromDateMessage);
    expect(fromDateErrors).toHaveLength(1);
    expect(fromDateErrors[0].property).toBe('fromDate');

    // Test invalid toDate type
    const invalidToDateMessage = new SyncCompanyTransactionsMessage({
      companyId: 'company-123',
      fromDate: '2024-01-01',
      toDate: 20240131 as any,
    });
    const toDateErrors = validateSync(invalidToDateMessage);
    expect(toDateErrors).toHaveLength(1);
    expect(toDateErrors[0].property).toBe('toDate');
  });

  it('should validate required properties', () => {
    // Test empty object
    const emptyMessage = new SyncCompanyTransactionsMessage({} as any);
    const emptyErrors = validateSync(emptyMessage);
    expect(emptyErrors).toHaveLength(3);
    
    // Test missing companyId
    const missingCompanyMessage = new SyncCompanyTransactionsMessage({
      fromDate: '2024-01-01',
      toDate: '2024-01-31',
    } as any);
    const missingCompanyErrors = validateSync(missingCompanyMessage);
    expect(missingCompanyErrors).toHaveLength(1);
    expect(missingCompanyErrors[0].property).toBe('companyId');
    
    // Test missing fromDate
    const missingFromDateMessage = new SyncCompanyTransactionsMessage({
      companyId: 'company-123',
      toDate: '2024-01-31',
    } as any);
    const missingFromDateErrors = validateSync(missingFromDateMessage);
    expect(missingFromDateErrors).toHaveLength(1);
    expect(missingFromDateErrors[0].property).toBe('fromDate');

    // Test missing toDate
    const missingToDateMessage = new SyncCompanyTransactionsMessage({
      companyId: 'company-123',
      fromDate: '2024-01-01',
    } as any);
    const missingToDateErrors = validateSync(missingToDateMessage);
    expect(missingToDateErrors).toHaveLength(1);
    expect(missingToDateErrors[0].property).toBe('toDate');
  });

  it('should handle empty string values', () => {
    const emptyStringMessage = new SyncCompanyTransactionsMessage({
      companyId: '',
      fromDate: '',
      toDate: '',
    });
    const errors = validateSync(emptyStringMessage);
    
    // Empty strings should still be valid strings according to @IsString() decorator
    expect(errors).toHaveLength(0);
    expect(emptyStringMessage.companyId).toBe('');
    expect(emptyStringMessage.fromDate).toBe('');
    expect(emptyStringMessage.toDate).toBe('');
  });

  it('should preserve all properties through constructor', () => {
    const message = new SyncCompanyTransactionsMessage(validMessage);
    
    expect(message.companyId).toBe(validMessage.companyId);
    expect(message.fromDate).toBe(validMessage.fromDate);
    expect(message.toDate).toBe(validMessage.toDate);
  });
});
