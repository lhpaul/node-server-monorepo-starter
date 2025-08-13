import { getBestAvailableLanguage } from '@repo/fastify';
import { LanguageCode, DEFAULT_LANGUAGE } from '@repo/shared/constants';
import { TransactionCategory, TransactionCategoryType } from '@repo/shared/domain';

import { parseTransactionCategoryToResponseResource } from '../transaction-categories.endpoint.utils';
import { TransactionCategoryResource } from '../transaction-categories.endpoint.interfaces';

// Mock the getBestAvailableLanguage function
jest.mock('@repo/fastify', () => ({
  getBestAvailableLanguage: jest.fn(),
}));

const mockGetBestAvailableLanguage = getBestAvailableLanguage as jest.MockedFunction<typeof getBestAvailableLanguage>;

describe(parseTransactionCategoryToResponseResource.name, () => {
  const mockDate = new Date('2023-01-01T00:00:00.000Z');
  const mockUpdatedDate = new Date('2023-01-02T00:00:00.000Z');
  
  const mockTransactionCategory = new TransactionCategory({
    id: 'test-category-id',
    name: {
      en: 'Food & Dining',
      es: 'Comida y Restaurantes',
      fr: 'Nourriture et Restaurants',
    },
    type: TransactionCategoryType.EXPENSE,
    createdAt: mockDate,
    updatedAt: mockUpdatedDate,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should transform transaction category to response resource with default language', () => {
    // Arrange
    mockGetBestAvailableLanguage.mockReturnValue(DEFAULT_LANGUAGE);

    // Act
    const result = parseTransactionCategoryToResponseResource(mockTransactionCategory);

    // Assert
    expect(mockGetBestAvailableLanguage).toHaveBeenCalledWith(undefined, ['en', 'es', 'fr']);
    expect(result).toEqual({
      id: 'test-category-id',
      name: 'Food & Dining',
      type: TransactionCategoryType.EXPENSE,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
    });
  });

  it('should transform transaction category to response resource with specified language', () => {
    // Arrange
    const acceptLanguage: LanguageCode = 'es';
    mockGetBestAvailableLanguage.mockReturnValue('es');

    // Act
    const result = parseTransactionCategoryToResponseResource(mockTransactionCategory, acceptLanguage);

    // Assert
    expect(mockGetBestAvailableLanguage).toHaveBeenCalledWith(acceptLanguage, ['en', 'es', 'fr']);
    expect(result).toEqual({
      id: 'test-category-id',
      name: 'Comida y Restaurantes',
      type: TransactionCategoryType.EXPENSE,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
    });
  });

  it('should handle income type transaction category', () => {
    // Arrange
    const incomeCategory = new TransactionCategory({
      id: 'income-category-id',
      name: {
        en: 'Salary',
        es: 'Salario',
      },
      type: TransactionCategoryType.INCOME,
      createdAt: mockDate,
      updatedAt: mockUpdatedDate,
    });
    mockGetBestAvailableLanguage.mockReturnValue('en');

    // Act
    const result = parseTransactionCategoryToResponseResource(incomeCategory, 'en');

    // Assert
    expect(result).toEqual({
      id: 'income-category-id',
      name: 'Salary',
      type: TransactionCategoryType.INCOME,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
    });
  });

  it('should handle transaction category with single language', () => {
    // Arrange
    const singleLanguageCategory = new TransactionCategory({
      id: 'single-lang-category-id',
      name: {
        en: 'Transportation',
      },
      type: TransactionCategoryType.EXPENSE,
      createdAt: mockDate,
      updatedAt: mockUpdatedDate,
    });
    mockGetBestAvailableLanguage.mockReturnValue('en');

    // Act
    const result = parseTransactionCategoryToResponseResource(singleLanguageCategory, 'en');

    // Assert
    expect(mockGetBestAvailableLanguage).toHaveBeenCalledWith('en', ['en']);
    expect(result).toEqual({
      id: 'single-lang-category-id',
      name: 'Transportation',
      type: TransactionCategoryType.EXPENSE,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
    });
  });

  it('should handle transaction category with multiple languages and fallback', () => {
    // Arrange
    const multiLanguageCategory = new TransactionCategory({
      id: 'multi-lang-category-id',
      name: {
        en: 'Shopping',
        es: 'Compras',
        fr: 'Achats',
        de: 'Einkaufen',
      },
      type: TransactionCategoryType.EXPENSE,
      createdAt: mockDate,
      updatedAt: mockUpdatedDate,
    });
    mockGetBestAvailableLanguage.mockReturnValue('fr');

    // Act
    const result = parseTransactionCategoryToResponseResource(multiLanguageCategory, 'fr');

    // Assert
    expect(mockGetBestAvailableLanguage).toHaveBeenCalledWith('fr', ['en', 'es', 'fr', 'de']);
    expect(result).toEqual({
      id: 'multi-lang-category-id',
      name: 'Achats',
      type: TransactionCategoryType.EXPENSE,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-02T00:00:00.000Z',
    });
  });

  it('should handle empty accept language parameter', () => {
    // Arrange
    mockGetBestAvailableLanguage.mockReturnValue(DEFAULT_LANGUAGE);

    // Act
    const result = parseTransactionCategoryToResponseResource(mockTransactionCategory, undefined);

    // Assert
    expect(mockGetBestAvailableLanguage).toHaveBeenCalledWith(undefined, ['en', 'es', 'fr']);
    expect(result.name).toBe('Food & Dining');
  });

  it('should handle empty string accept language parameter', () => {
    // Arrange
    mockGetBestAvailableLanguage.mockReturnValue(DEFAULT_LANGUAGE);

    // Act
    const result = parseTransactionCategoryToResponseResource(mockTransactionCategory, '' as LanguageCode);

    // Assert
    expect(mockGetBestAvailableLanguage).toHaveBeenCalledWith('', ['en', 'es', 'fr']);
    expect(result.name).toBe('Food & Dining');
  });

  it('should properly format dates as ISO strings', () => {
    // Arrange
    const customDate = new Date('2023-12-25T15:30:45.123Z');
    const customUpdatedDate = new Date('2023-12-26T10:15:20.456Z');
    
    const categoryWithCustomDates = new TransactionCategory({
      id: 'custom-dates-category-id',
      name: {
        en: 'Custom Category',
      },
      type: TransactionCategoryType.EXPENSE,
      createdAt: customDate,
      updatedAt: customUpdatedDate,
    });
    mockGetBestAvailableLanguage.mockReturnValue('en');

    // Act
    const result = parseTransactionCategoryToResponseResource(categoryWithCustomDates, 'en');

    // Assert
    expect(result.createdAt).toBe('2023-12-25T15:30:45.123Z');
    expect(result.updatedAt).toBe('2023-12-26T10:15:20.456Z');
  });

  it('should return correct resource structure', () => {
    // Arrange
    mockGetBestAvailableLanguage.mockReturnValue('en');

    // Act
    const result = parseTransactionCategoryToResponseResource(mockTransactionCategory, 'en');

    // Assert
    expect(result).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      type: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    } as TransactionCategoryResource);
  });

  it('should call getName with the preferred language', () => {
    // Arrange
    const getNameSpy = jest.spyOn(mockTransactionCategory, 'getName');
    mockGetBestAvailableLanguage.mockReturnValue('es');

    // Act
    parseTransactionCategoryToResponseResource(mockTransactionCategory, 'es');

    // Assert
    expect(getNameSpy).toHaveBeenCalledWith('es');
  });
}); 