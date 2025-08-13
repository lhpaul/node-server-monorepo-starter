import { getBestAvailableLanguage } from '@repo/fastify';
import { LanguageCode } from '@repo/shared/constants';
import { TransactionCategory } from '@repo/shared/domain';

import { TransactionCategoryResource } from './transaction-categories.endpoint.interfaces';

export function parseTransactionCategoryToResponseResource(transactionCategory: TransactionCategory, acceptLanguage?: LanguageCode): TransactionCategoryResource {
   // Get available languages from the category
   const availableLanguages = Object.keys(transactionCategory.name) as LanguageCode[];
    
   // Get the best available language based on Accept-Language header
   const preferredLanguage = getBestAvailableLanguage(acceptLanguage, availableLanguages);
   
   // Get the name in the preferred language
   const name = transactionCategory.getName(preferredLanguage);
   
   return {
     id: transactionCategory.id,
     name,
     type: transactionCategory.type,
     createdAt: transactionCategory.createdAt.toISOString(),
     updatedAt: transactionCategory.updatedAt.toISOString(),
   };
}