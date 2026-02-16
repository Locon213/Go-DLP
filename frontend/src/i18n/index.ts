// i18n модуль для Go-DLP
// Модульная система переводов с fallback на английский

import { UpdateLanguage } from '../../wailsjs/go/main/App';
import type { LanguageCode, Translations } from './types';
import { PartialTranslations } from './types';

// Импорты переводов
import { en } from './lang/en';
import { ru } from './lang/ru';
import { uk } from './lang/uk';
import { zh } from './lang/zh';
import { es } from './lang/es';
import { fr } from './lang/fr';
import { de } from './lang/de';
import { pt } from './lang/pt';
import { ja } from './lang/ja';
import { ko } from './lang/ko';
import { ar } from './lang/ar';

// Карта переводов - каждый язык может иметь частичные переводы
const translations: Record<LanguageCode, PartialTranslations> = {
  en,
  ru,
  uk,
  zh,
  es,
  fr,
  de,
  pt,
  ja,
  ko,
  ar,
};

// Список поддерживаемых языков
export const supportedLanguages: { code: LanguageCode; name: string; nativeName: string }[] = [
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
];

// Получить переводы для языка с fallback на английский
// Если ключа нет в целевом языке, используется английский вариант
export const getTranslations = (language: LanguageCode): Translations => {
  const targetTranslations = translations[language] || {};
  
  // Создаем полные переводы, используя английский как fallback
  const result = {} as Translations;
  const fallback = translations.en;
  
  // Получаем все ключи из интерфейса Translations
  const keys = Object.keys(fallback) as (keyof Translations)[];
  
  for (const key of keys) {
    // Используем перевод из целевого языка или fallback на английский
    result[key] = (targetTranslations[key] || fallback[key]) as string;
  }
  
  return result;
};

// Получить язык из localStorage или использовать системный язык
export const getInitialLanguage = (): LanguageCode => {
  const savedLanguage = localStorage.getItem('godlp-language') as LanguageCode;
  if (savedLanguage && translations[savedLanguage]) {
    return savedLanguage;
  }

  // Определяем системный язык
  const systemLanguage = navigator.language.split('-')[0] as LanguageCode;
  if (translations[systemLanguage]) {
    return systemLanguage;
  }

  return 'en'; // По умолчанию английский
};

// Сохранить язык в localStorage и на бэкенд
export const saveLanguage = async (language: LanguageCode): Promise<void> => {
  localStorage.setItem('godlp-language', language);

  // Также сохраняем на бэкенде через Wails API
  try {
    await UpdateLanguage(language);
  } catch (error) {
    console.error('Failed to save language to backend:', error);
  }
};

// Экспорт типов
export type { LanguageCode, Translations, PartialTranslations };

// Экспорт отдельных переводов для прямого доступа
export { en, ru, uk, zh, es, fr, de, pt, ja, ko, ar };
