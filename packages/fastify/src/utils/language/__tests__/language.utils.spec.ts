import { parseAcceptLanguage, extractBaseLanguageCode, getBestAvailableLanguage } from '../language.utils';

describe('Language Utils', () => {
  describe(parseAcceptLanguage.name, () => {
    it('should return default language when no header is provided', () => {
      expect(parseAcceptLanguage()).toBe('en');
      expect(parseAcceptLanguage('')).toBe('en');
    });

    it('should parse simple language codes', () => {
      expect(parseAcceptLanguage('en')).toBe('en');
      expect(parseAcceptLanguage('es')).toBe('es');
      expect(parseAcceptLanguage('fr')).toBe('fr');
      expect(parseAcceptLanguage('ja')).toBe('ja');
    });

    it('should parse language codes with regions', () => {
      expect(parseAcceptLanguage('en-US')).toBe('en-US');
      expect(parseAcceptLanguage('es-MX')).toBe('es-MX');
      expect(parseAcceptLanguage('zh-CN')).toBe('zh-CN');
      expect(parseAcceptLanguage('ko-KR')).toBe('ko-KR');
    });

    it('should parse complex Accept-Language headers with quality values', () => {
      expect(parseAcceptLanguage('en-US,en;q=0.9,es;q=0.8')).toBe('en-US');
      expect(parseAcceptLanguage('es;q=0.9,en;q=0.8,fr;q=0.7')).toBe('es');
      expect(parseAcceptLanguage('zh-CN,zh;q=0.9,en;q=0.8')).toBe('zh-CN');
    });

    it('should handle whitespace in headers', () => {
      expect(parseAcceptLanguage(' en-US , en ; q=0.9 ')).toBe('en-US');
      expect(parseAcceptLanguage('  es  ,  en  ;  q=0.8  ')).toBe('es');
    });

    it('should sort by quality values correctly', () => {
      expect(parseAcceptLanguage('en;q=0.8,es;q=0.9,fr;q=0.7')).toBe('es');
      expect(parseAcceptLanguage('fr;q=0.5,en;q=0.9,es;q=0.8')).toBe('en');
    });

    it('should handle malformed quality values', () => {
      expect(parseAcceptLanguage('en;q=invalid,es')).toBe('es');
      expect(parseAcceptLanguage('en;q=,es')).toBe('es');
    });

    it('should return default language when no valid language is provided', () => {
      expect(parseAcceptLanguage('es;q=invalid')).toBe('en');
    });
  });

  describe(extractBaseLanguageCode.name, () => {
    it('should extract base language from simple codes', () => {
      expect(extractBaseLanguageCode('en')).toBe('en');
      expect(extractBaseLanguageCode('es')).toBe('es');
      expect(extractBaseLanguageCode('fr')).toBe('fr');
    });

    it('should extract base language from regional codes', () => {
      expect(extractBaseLanguageCode('en-US')).toBe('en');
      expect(extractBaseLanguageCode('es-MX')).toBe('es');
      expect(extractBaseLanguageCode('zh-CN')).toBe('zh');
      expect(extractBaseLanguageCode('ko-KR')).toBe('ko');
    });

    it('should handle codes with multiple hyphens', () => {
      expect(extractBaseLanguageCode('en-US-POSIX')).toBe('en');
      expect(extractBaseLanguageCode('zh-Hans-CN')).toBe('zh');
    });
  });

  describe(getBestAvailableLanguage.name, () => {
    const availableLanguages = ['en', 'es', 'fr', 'ja', 'zh-CN', 'ko-KR'];

    it('should return default when no Accept-Language header', () => {
      expect(getBestAvailableLanguage(undefined, availableLanguages)).toBe('en');
      expect(getBestAvailableLanguage('', availableLanguages)).toBe('en');
    });

    it('should return default when no available languages', () => {
      expect(getBestAvailableLanguage('en-US', [])).toBe('en');
    });

    it('should find exact matches', () => {
      expect(getBestAvailableLanguage('en', availableLanguages)).toBe('en');
      expect(getBestAvailableLanguage('es', availableLanguages)).toBe('es');
      expect(getBestAvailableLanguage('fr', availableLanguages)).toBe('fr');
      expect(getBestAvailableLanguage('ja', availableLanguages)).toBe('ja');
    });

    it('should find exact matches for regional codes', () => {
      expect(getBestAvailableLanguage('zh-CN', availableLanguages)).toBe('zh-CN');
      expect(getBestAvailableLanguage('ko-KR', availableLanguages)).toBe('ko-KR');
    });

    it('should fallback to base language when regional code not available', () => {
      expect(getBestAvailableLanguage('en-US', availableLanguages)).toBe('en');
      expect(getBestAvailableLanguage('es-MX', availableLanguages)).toBe('es');
      expect(getBestAvailableLanguage('fr-CA', availableLanguages)).toBe('fr');
    });

    it('should fallback to default when no match found', () => {
      expect(getBestAvailableLanguage('de', availableLanguages)).toBe('en');
      expect(getBestAvailableLanguage('it', availableLanguages)).toBe('en');
      expect(getBestAvailableLanguage('pt', availableLanguages)).toBe('en');
    });

    it('should handle complex Accept-Language headers', () => {
      expect(getBestAvailableLanguage('en-US,en;q=0.9,es;q=0.8', availableLanguages)).toBe('en');
      expect(getBestAvailableLanguage('es-MX,es;q=0.9,en;q=0.8', availableLanguages)).toBe('es');
      expect(getBestAvailableLanguage('zh-TW,zh;q=0.9,en;q=0.8', availableLanguages)).toBe('zh-CN');
    });

    it('should prioritize higher quality values', () => {
      expect(getBestAvailableLanguage('en;q=0.8,es;q=0.9,fr;q=0.7', availableLanguages)).toBe('es');
      expect(getBestAvailableLanguage('fr;q=0.5,en;q=0.9,es;q=0.8', availableLanguages)).toBe('en');
    });
  });
}); 