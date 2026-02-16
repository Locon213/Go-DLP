import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LanguageCode, Translations, getInitialLanguage, getTranslations } from './index';
import { UpdateLanguage as UpdateLanguageAPI, GetSettings as GetSettingsAPI } from '../../wailsjs/go/main/App';

// Re-export LanguageCode for convenience
export type { LanguageCode };

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(getInitialLanguage());
  const [t, setT] = useState<Translations>(getTranslations(language));

  // Загрузить язык из бэкенда при инициализации
  useEffect(() => {
    const loadLanguageFromBackend = async () => {
      try {
        const settingsJson = await GetSettingsAPI();
        const settings = JSON.parse(settingsJson);
        if (settings.language && settings.language !== language) {
          setLanguageState(settings.language as LanguageCode);
          setT(getTranslations(settings.language));
        }
      } catch (error) {
        console.error('Failed to load language from backend:', error);
      }
    };
    
    loadLanguageFromBackend();
  }, []);

  useEffect(() => {
    setT(getTranslations(language));
  }, [language]);

  const setLanguage = async (newLanguage: LanguageCode) => {
    setLanguageState(newLanguage);
    // Сохраняем в localStorage и на бэкенде
    try {
      await UpdateLanguageAPI(newLanguage);
    } catch (error) {
      console.error('Failed to save language to backend:', error);
    }
    localStorage.setItem('godlp-language', newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
