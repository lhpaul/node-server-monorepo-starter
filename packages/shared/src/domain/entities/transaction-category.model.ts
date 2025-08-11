import { LanguageCode, DEFAULT_LANGUAGE } from '../../constants/languages.constants';
import { EntityModel } from '../../definitions';

export enum TransactionCategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface TransactionCategoryData {
  createdAt: Date;
  id: string;
  name: Record<LanguageCode, string>;
  type: TransactionCategoryType;
  updatedAt: Date;
}

export class TransactionCategory implements EntityModel {
  public readonly createdAt: Date; // date of creation
  public readonly id: string;
  public readonly name: Record<LanguageCode, string>; // name of the category in multiple languages
  public readonly type: TransactionCategoryType; // type of the category
  public readonly updatedAt: Date; // date of last update

  constructor(transactionCategory: Required<TransactionCategoryData>) {
    Object.assign(this, transactionCategory);
  }

  /**
   * Gets the name in the specified language, falling back to default language if not available
   * @param language - The language code to get the name for
   * @returns The name in the specified language or default language
   */
  public getName(language: LanguageCode = DEFAULT_LANGUAGE): string {
    return this.name[language] || this.name[DEFAULT_LANGUAGE] || Object.values(this.name)[0] || '';
  }
}