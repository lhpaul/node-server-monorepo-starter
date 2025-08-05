import { TransactionCategoryType } from '../../domain/models/transaction-category.model';
import { TransactionCategoryDocument } from './transaction-categories.repository.interfaces';

export const MOCK_TRANSACTION_CATEGORIES: TransactionCategoryDocument[] = [
  { 
    createdAt: new Date(), 
    id: '0', 
    name: { en: 'Salary', es: 'Salario', fr: 'Salaire', de: 'Gehalt', pt: 'Salário', it: 'Stipendio' }, 
    type: TransactionCategoryType.INCOME, 
    updatedAt: new Date() 
  },
  { 
    createdAt: new Date(), 
    id: '1', 
    name: { en: 'Freelance', es: 'Freelance', fr: 'Freelance', de: 'Freelance', pt: 'Freelance', it: 'Freelance' }, 
    type: TransactionCategoryType.INCOME, 
    updatedAt: new Date() 
  },
  { 
    createdAt: new Date(), 
    id: '2', 
    name: { en: 'Investment Returns', es: 'Retornos de Inversión', fr: 'Rendements d\'Investissement', de: 'Anlageerträge', pt: 'Retornos de Investimento', it: 'Rendimenti degli Investimenti' }, 
    type: TransactionCategoryType.INCOME, 
    updatedAt: new Date() 
  },
  { 
    createdAt: new Date(), 
    id: '3', 
    name: { en: 'Groceries', es: 'Comestibles', fr: 'Épicerie', de: 'Lebensmittel', pt: 'Mantimentos', it: 'Generi alimentari' }, 
    type: TransactionCategoryType.EXPENSE, 
    updatedAt: new Date() 
  },
  { 
    createdAt: new Date(), 
    id: '4', 
    name: { en: 'Transportation', es: 'Transporte', fr: 'Transport', de: 'Transport', pt: 'Transporte', it: 'Trasporto' }, 
    type: TransactionCategoryType.EXPENSE, 
    updatedAt: new Date() 
  },
  { 
    createdAt: new Date(), 
    id: '5', 
    name: { en: 'Entertainment', es: 'Entretenimiento', fr: 'Divertissement', de: 'Unterhaltung', pt: 'Entretenimento', it: 'Intrattenimento' }, 
    type: TransactionCategoryType.EXPENSE, 
    updatedAt: new Date() 
  },
  { 
    createdAt: new Date(), 
    id: '6', 
    name: { en: 'Utilities', es: 'Servicios Públicos', fr: 'Services Publics', de: 'Versorgungsunternehmen', pt: 'Serviços Públicos', it: 'Servizi Pubblici' }, 
    type: TransactionCategoryType.EXPENSE, 
    updatedAt: new Date() 
  },
  { 
    createdAt: new Date(), 
    id: '7', 
    name: { en: 'Rent', es: 'Alquiler', fr: 'Loyer', de: 'Miete', pt: 'Aluguel', it: 'Affitto' }, 
    type: TransactionCategoryType.EXPENSE, 
    updatedAt: new Date() 
  },
]; 