import { TransactionCategory, TransactionCategoryType } from '../transaction-category.model';

describe(TransactionCategory.name, () => {
  const initialValues = {
    createdAt: new Date('2024-01-01T00:00:00Z'),
    id: 'category-123',
    name: 'Groceries',
    type: TransactionCategoryType.EXPENSE,
    updatedAt: new Date('2024-01-02T00:00:00Z'),
  };
  let transactionCategory: TransactionCategory;

  beforeEach(() => {
    transactionCategory = new TransactionCategory(initialValues);
  });

  describe('Initialization', () => {
    it('should create a new transaction category instance', () => {
      expect(transactionCategory).toBeInstanceOf(TransactionCategory);
    });

    it('should initialize with correct values', () => {
      expect(transactionCategory.createdAt).toBe(initialValues.createdAt);
      expect(transactionCategory.id).toBe(initialValues.id);
      expect(transactionCategory.name).toBe(initialValues.name);
      expect(transactionCategory.type).toBe(initialValues.type);
      expect(transactionCategory.updatedAt).toBe(initialValues.updatedAt);
    });

    it('should handle income type category', () => {
      const incomeCategory = new TransactionCategory({
        ...initialValues,
        name: 'Salary',
        type: TransactionCategoryType.INCOME,
      });

      expect(incomeCategory.type).toBe(TransactionCategoryType.INCOME);
      expect(incomeCategory.name).toBe('Salary');
    });

    it('should handle expense type category', () => {
      const expenseCategory = new TransactionCategory({
        ...initialValues,
        name: 'Rent',
        type: TransactionCategoryType.EXPENSE,
      });

      expect(expenseCategory.type).toBe(TransactionCategoryType.EXPENSE);
      expect(expenseCategory.name).toBe('Rent');
    });
  });

  describe('TransactionCategoryType Enum', () => {
    it('should have correct INCOME value', () => {
      expect(TransactionCategoryType.INCOME).toBe('income');
    });

    it('should have correct EXPENSE value', () => {
      expect(TransactionCategoryType.EXPENSE).toBe('expense');
    });

    it('should have exactly two enum values', () => {
      const enumValues = Object.values(TransactionCategoryType);
      expect(enumValues).toHaveLength(2);
      expect(enumValues).toContain('income');
      expect(enumValues).toContain('expense');
    });
  });

  describe('Properties', () => {

    it('should have all required properties', () => {
      expect(transactionCategory).toHaveProperty('createdAt');
      expect(transactionCategory).toHaveProperty('id');
      expect(transactionCategory).toHaveProperty('name');
      expect(transactionCategory).toHaveProperty('type');
      expect(transactionCategory).toHaveProperty('updatedAt');
    });

    it('should have correct property types', () => {
      expect(typeof transactionCategory.createdAt).toBe('object');
      expect(transactionCategory.createdAt).toBeInstanceOf(Date);
      expect(typeof transactionCategory.id).toBe('string');
      expect(typeof transactionCategory.name).toBe('string');
      expect(typeof transactionCategory.type).toBe('string');
      expect(typeof transactionCategory.updatedAt).toBe('object');
      expect(transactionCategory.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Constructor', () => {
    it('should accept Required<TransactionCategory> parameter', () => {
      const categoryData = {
        createdAt: new Date(),
        id: 'test-id',
        name: 'Test Category',
        type: TransactionCategoryType.INCOME,
        updatedAt: new Date(),
      };

      const category = new TransactionCategory(categoryData);
      expect(category).toBeInstanceOf(TransactionCategory);
      expect(category.id).toBe(categoryData.id);
    });

    it('should handle different category names', () => {
      const categories = [
        'Food & Dining',
        'Transportation',
        'Entertainment',
        'Healthcare',
        'Shopping',
        'Bills & Utilities',
      ];

      categories.forEach((name) => {
        const category = new TransactionCategory({
          ...initialValues,
          name,
        });
        expect(category.name).toBe(name);
      });
    });
  });
}); 