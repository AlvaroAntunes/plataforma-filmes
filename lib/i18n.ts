export const locales = ['en', 'pt-BR', 'es', 'zh'] as const;
export const defaultLocale = 'en' as const;
export type Locale = typeof locales[number];

export const localeNames = {
  'en': 'English',
  'pt-BR': 'Português',
  'es': 'Español',
  'zh': '中文'
} as const;
