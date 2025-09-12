import { NotifySubscriptionAboutToExpireMessage } from '../notify-subscription-about-to-expire.message';
import { validateSync } from 'class-validator';

describe(NotifySubscriptionAboutToExpireMessage.name, () => {
  const validMessage = {
    companyId: 'company-123',
    daysToExpire: 7,
  };

  it('should create a valid message instance', () => {
    const message = new NotifySubscriptionAboutToExpireMessage(validMessage);
    const errors = validateSync(message);
    
    expect(errors).toHaveLength(0);
    expect(message).toBeInstanceOf(NotifySubscriptionAboutToExpireMessage);
    expect(message.companyId).toBe(validMessage.companyId);
    expect(message.daysToExpire).toBe(validMessage.daysToExpire);
  });

  it('should validate property types', () => {
    // Test invalid companyId type
    const invalidCompanyIdMessage = new NotifySubscriptionAboutToExpireMessage({
      companyId: 123 as any,
      daysToExpire: 7,
    });
    const companyIdErrors = validateSync(invalidCompanyIdMessage);
    expect(companyIdErrors).toHaveLength(1);
    expect(companyIdErrors[0].property).toBe('companyId');

    // Test invalid daysToExpire type
    const invalidDaysMessage = new NotifySubscriptionAboutToExpireMessage({
      companyId: 'company-123',
      daysToExpire: '7' as any,
    });
    const daysErrors = validateSync(invalidDaysMessage);
    expect(daysErrors).toHaveLength(1);
    expect(daysErrors[0].property).toBe('daysToExpire');
  });

  it('should validate required properties', () => {
    // Test empty object
    const emptyMessage = new NotifySubscriptionAboutToExpireMessage({} as any);
    const emptyErrors = validateSync(emptyMessage);
    expect(emptyErrors).toHaveLength(2);
    
    // Test missing daysToExpire
    const missingDaysMessage = new NotifySubscriptionAboutToExpireMessage({ companyId: 'company-123' } as any);
    const missingDaysErrors = validateSync(missingDaysMessage);
    expect(missingDaysErrors).toHaveLength(1);
    
    // Test missing companyId
    const missingCompanyMessage = new NotifySubscriptionAboutToExpireMessage({ daysToExpire: 7 } as any);
    const missingCompanyErrors = validateSync(missingCompanyMessage);
    expect(missingCompanyErrors).toHaveLength(1);
  });
}); 