import { Subscription } from '../subscription.model';

describe(Subscription.name, () => {
  const initialValues = {
    companyId: '0',
    createdAt: new Date(),
    endsAt: new Date(),
    id: 'txn-123',
    startsAt: new Date(),
    updatedAt: new Date(),
  };
  let subscription: Subscription;

  beforeEach(() => {
    subscription = new Subscription(initialValues);
  });

  describe('Initialization', () => {
    it('should create a new subscription instance', () => {
      expect(subscription).toBeInstanceOf(Subscription);
    });

    it('should initialize with correct values', () => {
      expect(subscription.companyId).toBe(initialValues.companyId);
      expect(subscription.createdAt).toBe(initialValues.createdAt);
      expect(subscription.endsAt).toBe(initialValues.endsAt);
      expect(subscription.id).toBe(initialValues.id);
      expect(subscription.startsAt).toBe(initialValues.startsAt);
      expect(subscription.updatedAt).toBe(initialValues.updatedAt);
    });
  });
});
