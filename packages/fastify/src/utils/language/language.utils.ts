import { LanguageCode, DEFAULT_LANGUAGE } from '@repo/shared/constants';

/**
 * Parse Accept-Language header and return the preferred language code
 * @param acceptLanguage - The Accept-Language header value (e.g., "en-US,en;q=0.9,es;q=0.8")
 * @returns The preferred language code, falling back to default if none found
 */
export function parseAcceptLanguage(acceptLanguage?: string): LanguageCode {
  if (!acceptLanguage) {
    return DEFAULT_LANGUAGE;
  }

  // Parse the Accept-Language header
  // Format: "en-US,en;q=0.9,es;q=0.8,fr;q=0.7"
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [language, quality = 'q=1.0'] = lang.trim().split(';');
      const qValue = parseFloat(quality.replace('q=', ''));
      return { language: language.trim(), quality: qValue };
    })
    .filter(lang => !isNaN(lang.quality)) // Filter out malformed quality values
    .sort((a, b) => b.quality - a.quality); // Sort by quality (highest first)

  // Return the first language code, or default if none found
  return languages.length ? languages[0].language : DEFAULT_LANGUAGE;
}

/**
 * Extract language code from a full language tag
 * @param languageTag - Full language tag (e.g., "en-US", "es-MX", "zh-CN")
 * @returns The base language code (e.g., "en", "es", "zh")
 */
export function extractBaseLanguageCode(languageTag: string): LanguageCode {
  return languageTag.split('-')[0] as LanguageCode;
}

/**
 * Get the best available language from a list of available languages
 * @param acceptLanguage - The Accept-Language header value
 * @param availableLanguages - Array of available language codes
 * @returns The best matching language code, or default if none matches
 */
export function getBestAvailableLanguage(
  acceptLanguage: string | undefined,
  availableLanguages: LanguageCode[]
): LanguageCode {
  if (!acceptLanguage || availableLanguages.length === 0) {
    return DEFAULT_LANGUAGE;
  }

  const preferredLanguage = parseAcceptLanguage(acceptLanguage);
  
  // First try exact match
  if (availableLanguages.includes(preferredLanguage)) {
    return preferredLanguage;
  }

  // Then try base language match (e.g., if preferred is "en-US" and available is "en")
  const baseLanguage = extractBaseLanguageCode(preferredLanguage);
  if (availableLanguages.includes(baseLanguage)) {
    return baseLanguage;
  }

  // Finally, try to find any language that starts with the base language
  const matchingLanguage = availableLanguages.find(lang => 
    lang.startsWith(baseLanguage) || baseLanguage.startsWith(lang.split('-')[0])
  );

  return matchingLanguage || DEFAULT_LANGUAGE;
} 