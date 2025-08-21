export const DEFAULT_LANGUAGE = 'en';

export type LanguageCode = string; // Any ISO 639 language code

// Common language codes for reference (not enforced)
export const COMMON_LANGUAGES = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
  zh: '中文',
  ru: 'Русский',
  ar: 'العربية',
  hi: 'हिन्दी',
  nl: 'Nederlands',
  sv: 'Svenska',
  da: 'Dansk',
  no: 'Norsk',
  fi: 'Suomi',
  pl: 'Polski',
  tr: 'Türkçe',
  he: 'עברית',
};

export type CommonLanguageCode = keyof typeof COMMON_LANGUAGES; 