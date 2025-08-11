import { TransactionCategory, TransactionCategoryType } from '../transaction-category.model';

describe(TransactionCategory.name, () => {
  const initialValues = {
    createdAt: new Date('2024-01-01T00:00:00Z'),
    id: 'category-123',
    name: {
      en: 'Groceries',
      es: 'Comestibles',
      fr: 'Épicerie',
      de: 'Lebensmittel',
      pt: 'Mantimentos',
      it: 'Generi alimentari',
      ja: '食料品',
      ko: '식료품',
      zh: '杂货',
      ru: 'Продукты',
      ar: 'بقالة',
    },
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
      expect(transactionCategory.name).toEqual(initialValues.name);
      expect(transactionCategory.type).toBe(initialValues.type);
      expect(transactionCategory.updatedAt).toBe(initialValues.updatedAt);
    });

    it('should handle income type category', () => {
      const incomeCategory = new TransactionCategory({
        ...initialValues,
        name: {
          en: 'Salary',
          es: 'Salario',
          fr: 'Salaire',
          de: 'Gehalt',
          pt: 'Salário',
          it: 'Stipendio',
          ja: '給料',
          ko: '급여',
          zh: '工资',
          ru: 'Зарплата',
          ar: 'راتب',
        },
        type: TransactionCategoryType.INCOME,
      });

      expect(incomeCategory.type).toBe(TransactionCategoryType.INCOME);
      expect(incomeCategory.name.en).toBe('Salary');
    });

    it('should handle expense type category', () => {
      const expenseCategory = new TransactionCategory({
        ...initialValues,
        name: {
          en: 'Rent',
          es: 'Alquiler',
          fr: 'Loyer',
          de: 'Miete',
          pt: 'Aluguel',
          it: 'Affitto',
          ja: '家賃',
          ko: '임대료',
          zh: '租金',
          ru: 'Аренда',
          ar: 'إيجار',
        },
        type: TransactionCategoryType.EXPENSE,
      });

      expect(expenseCategory.type).toBe(TransactionCategoryType.EXPENSE);
      expect(expenseCategory.name.en).toBe('Rent');
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
      expect(typeof transactionCategory.name).toBe('object');
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
        name: {
          en: 'Test Category',
          es: 'Categoría de Prueba',
          fr: 'Catégorie de Test',
          de: 'Testkategorie',
          pt: 'Categoria de Teste',
          it: 'Categoria di Test',
          ja: 'テストカテゴリ',
          ko: '테스트 카테고리',
          zh: '测试类别',
          ru: 'Тестовая категория',
          ar: 'فئة اختبار',
        },
        type: TransactionCategoryType.INCOME,
        updatedAt: new Date(),
      };

      const category = new TransactionCategory(categoryData);
      expect(category).toBeInstanceOf(TransactionCategory);
      expect(category.id).toBe(categoryData.id);
    });

    it('should handle different category names', () => {
      const categories = [
        {
          en: 'Food & Dining',
          es: 'Comida y Restaurantes',
          fr: 'Nourriture et Restaurants',
          de: 'Essen und Restaurants',
          pt: 'Comida e Restaurantes',
          it: 'Cibo e Ristoranti',
          ja: '食事とレストラン',
          ko: '음식 및 레스토랑',
          zh: '餐饮',
          ru: 'Еда и рестораны',
          ar: 'طعام ومطاعم',
        },
        {
          en: 'Transportation',
          es: 'Transporte',
          fr: 'Transport',
          de: 'Transport',
          pt: 'Transporte',
          it: 'Trasporto',
          ja: '交通',
          ko: '교통',
          zh: '交通',
          ru: 'Транспорт',
          ar: 'نقل',
        },
        {
          en: 'Entertainment',
          es: 'Entretenimiento',
          fr: 'Divertissement',
          de: 'Unterhaltung',
          pt: 'Entretenimento',
          it: 'Intrattenimento',
          ja: 'エンターテイメント',
          ko: '엔터테인먼트',
          zh: '娱乐',
          ru: 'Развлечения',
          ar: 'ترفيه',
        },
      ];

      categories.forEach((name) => {
        const category = new TransactionCategory({
          ...initialValues,
          name,
        });
        expect(category.name).toEqual(name);
      });
    });

    it('should handle custom language codes', () => {
      const customLanguageCategory = new TransactionCategory({
        ...initialValues,
        name: {
          'en-US': 'American Groceries',
          'en-GB': 'British Groceries',
          'es-MX': 'Comestibles Mexicanos',
          'es-ES': 'Comestibles Españoles',
          'fr-CA': 'Épicerie Canadienne',
          'pt-BR': 'Mantimentos Brasileiros',
          'zh-CN': '中国杂货',
          'zh-TW': '台灣雜貨',
          'ko-KR': '한국 식료품',
          'ja-JP': '日本の食料品',
        },
      });

      expect(customLanguageCategory.name['en-US']).toBe('American Groceries');
      expect(customLanguageCategory.name['zh-CN']).toBe('中国杂货');
      expect(customLanguageCategory.name['ko-KR']).toBe('한국 식료품');
    });
  });

  describe(`${TransactionCategory.prototype.getName.name} method`, () => {
    it('should return name in specified language', () => {
      expect(transactionCategory.getName('en')).toBe('Groceries');
      expect(transactionCategory.getName('es')).toBe('Comestibles');
      expect(transactionCategory.getName('fr')).toBe('Épicerie');
      expect(transactionCategory.getName('ja')).toBe('食料品');
      expect(transactionCategory.getName('ko')).toBe('식료품');
      expect(transactionCategory.getName('zh')).toBe('杂货');
      expect(transactionCategory.getName('ru')).toBe('Продукты');
      expect(transactionCategory.getName('ar')).toBe('بقالة');
    });

    it('should fallback to English when specified language is not available', () => {
      const categoryWithPartialTranslations = new TransactionCategory({
        ...initialValues,
        name: {
          en: 'Test Category',
          es: 'Categoría de Prueba',
        },
      });

      expect(categoryWithPartialTranslations.getName('fr')).toBe('Test Category');
      expect(categoryWithPartialTranslations.getName('ja')).toBe('Test Category');
    });

    it('should fallback to first available translation when English is not available', () => {
      const categoryWithoutEnglish = new TransactionCategory({
        ...initialValues,
        name: {
          es: 'Categoría de Prueba',
          fr: 'Catégorie de Test',
          ja: 'テストカテゴリ',
        },
      });

      expect(categoryWithoutEnglish.getName('en')).toBe('Categoría de Prueba');
    });

    it('should return empty string when no translations are available', () => {
      const categoryWithoutTranslations = new TransactionCategory({
        ...initialValues,
        name: {},
      });

      expect(categoryWithoutTranslations.getName('en')).toBe('');
    });

    it('should use English as default when no language is specified', () => {
      expect(transactionCategory.getName()).toBe('Groceries');
    });

    it('should handle custom language codes', () => {
      const customLanguageCategory = new TransactionCategory({
        ...initialValues,
        name: {
          'en-US': 'American Groceries',
          'en-GB': 'British Groceries',
          'es-MX': 'Comestibles Mexicanos',
        },
      });

      expect(customLanguageCategory.getName('en-US')).toBe('American Groceries');
      expect(customLanguageCategory.getName('en-GB')).toBe('British Groceries');
      expect(customLanguageCategory.getName('es-MX')).toBe('Comestibles Mexicanos');
    });
  });
}); 