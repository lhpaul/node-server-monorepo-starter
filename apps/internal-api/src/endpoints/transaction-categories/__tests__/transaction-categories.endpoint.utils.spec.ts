import { TransactionCategory, TransactionCategoryType } from '@repo/shared/domain';
import { parseTransactionCategoryToResource } from '../transaction-categories.endpoint.utils';
import { TransactionCategoryResource } from '../transaction-categories.endpoint.interfaces';

describe(parseTransactionCategoryToResource.name, () => {
  const mockDate = new Date('2023-01-01T00:00:00.000Z');
  const mockUpdatedDate = new Date('2023-01-02T00:00:00.000Z');
  
  const mockTransactionCategory: TransactionCategory = new TransactionCategory({
    id: 'test-id-123',
    name: {
      en: 'Test Category',
      es: 'Categoría de Prueba',
      fr: 'Catégorie de Test',
    },
    type: TransactionCategoryType.EXPENSE,
    createdAt: mockDate,
    updatedAt: mockUpdatedDate,
  });

  it('should correctly parse a TransactionCategory to TransactionCategoryResource', () => {
    const result = parseTransactionCategoryToResource(mockTransactionCategory);

    const expected: TransactionCategoryResource = {
      id: 'test-id-123',
      name: {
        en: 'Test Category',
        es: 'Categoría de Prueba',
        fr: 'Catégorie de Test',
      },
      type: TransactionCategoryType.EXPENSE,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
    };

    expect(result).toEqual(expected);
  });

  it('should handle income type transaction category', () => {
    const incomeCategory = new TransactionCategory({
      ...mockTransactionCategory,
      type: TransactionCategoryType.INCOME,
    });

    const result = parseTransactionCategoryToResource(incomeCategory);

    expect(result.type).toBe(TransactionCategoryType.INCOME);
    expect(result.id).toBe('test-id-123');
  });

  it('should handle expense type transaction category', () => {
    const expenseCategory = new TransactionCategory({
      ...mockTransactionCategory,
      type: TransactionCategoryType.EXPENSE,
    });

    const result = parseTransactionCategoryToResource(expenseCategory);

    expect(result.type).toBe(TransactionCategoryType.EXPENSE);
    expect(result.id).toBe('test-id-123');
  });

  it('should convert Date objects to ISO strings for createdAt and updatedAt', () => {
    const result = parseTransactionCategoryToResource(mockTransactionCategory);

    expect(result.createdAt).toBe('2023-01-01T00:00:00.000Z');
    expect(result.updatedAt).toBe('2023-01-02T00:00:00.000Z');
    expect(typeof result.createdAt).toBe('string');
    expect(typeof result.updatedAt).toBe('string');
  });

  it('should preserve all name translations', () => {
    const result = parseTransactionCategoryToResource(mockTransactionCategory);

    expect(result.name.en).toBe('Test Category');
    expect(result.name.es).toBe('Categoría de Prueba');
    expect(result.name.fr).toBe('Catégorie de Test');
  });

  it('should handle transaction category with minimal name translations', () => {
    const minimalCategory = new TransactionCategory({
      id: 'minimal-id',
      name: {
        en: 'Minimal Category',
      },
      type: TransactionCategoryType.EXPENSE,
      createdAt: mockDate,
      updatedAt: mockUpdatedDate,
    });

    const result = parseTransactionCategoryToResource(minimalCategory);

    expect(result.name.en).toBe('Minimal Category');
    expect(result.name.es).toBeUndefined();
    expect(result.name.fr).toBeUndefined();
  });

  it('should handle transaction category with empty name translations', () => {
    const emptyNameCategory = new TransactionCategory({
      id: 'empty-name-id',
      name: {},
      type: TransactionCategoryType.INCOME,
      createdAt: mockDate,
      updatedAt: mockUpdatedDate,
    });

    const result = parseTransactionCategoryToResource(emptyNameCategory);

    expect(result.name).toEqual({});
    expect(result.id).toBe('empty-name-id');
    expect(result.type).toBe(TransactionCategoryType.INCOME);
  });

  it('should handle transaction category with same dates for createdAt and updatedAt', () => {
    const sameDateCategory = new TransactionCategory({
      ...mockTransactionCategory,
      createdAt: mockDate,
      updatedAt: mockDate,
    });

    const result = parseTransactionCategoryToResource(sameDateCategory);

    expect(result.createdAt).toBe('2023-01-01T00:00:00.000Z');
    expect(result.updatedAt).toBe('2023-01-01T00:00:00.000Z');
    expect(result.createdAt).toBe(result.updatedAt);
  });

  it('should handle transaction category with different language codes', () => {
    const customLanguageCategory = new TransactionCategory({
      id: 'custom-lang-id',
      name: {
        ja: 'テストカテゴリ',
        ko: '테스트 카테고리',
        'zh-CN': '测试类别',
      },
      type: TransactionCategoryType.EXPENSE,
      createdAt: mockDate,
      updatedAt: mockUpdatedDate,
    });

    const result = parseTransactionCategoryToResource(customLanguageCategory);

    expect(result.name.ja).toBe('テストカテゴリ');
    expect(result.name.ko).toBe('테스트 카테고리');
    expect(result.name['zh-CN']).toBe('测试类别');
    expect(result.id).toBe('custom-lang-id');
  });
}); 