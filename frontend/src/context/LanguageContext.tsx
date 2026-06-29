/**
 * LanguageContext.tsx
 * Provides global language state (English / Hindi) with AsyncStorage persistence.
 * - useLanguage() gives access to: language, setLanguage, t() (translate), isHindi
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { en } from '../i18n/en';
import { hi } from '../i18n/hi';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslateFunction;
  isHindi: boolean;
}

// A nested key accessor: t('volunteer.home.greeting')
type TranslateFunction = (key: string, options?: string | { fallback?: string; returnObjects?: boolean }) => any;

// ─── Context ─────────────────────────────────────────────────────────────────

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
  isHindi: false,
});

// ─── Storage Key ─────────────────────────────────────────────────────────────

const LANGUAGE_KEY = '@sevasetu_language';

// ─── Helper: deep-get nested value by dot-notation key ───────────────────────

function getNestedValue(obj: any, path: string, returnObjects?: boolean): any {
  const keys = path.split('.');
  let current = obj;
  for (const k of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[k];
  }
  
  if (returnObjects) return current;
  return typeof current === 'string' ? current : undefined;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Load persisted language on mount
  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY).then((stored) => {
      if (stored === 'hi' || stored === 'en') {
        setLanguageState(stored);
      }
    });
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  }, []);

  // Translation function
  const t: TranslateFunction = useCallback(
    (key: string, options?: string | { fallback?: string; returnObjects?: boolean }): any => {
      const fallback = typeof options === 'string' ? options : options?.fallback;
      const returnObjects = typeof options === 'object' ? options?.returnObjects : false;

      const dict = language === 'hi' ? hi : en;
      const value = getNestedValue(dict, key, returnObjects);
      if (value !== undefined) return value;
      // Fallback to English if Hindi key is missing
      if (language === 'hi') {
        const enValue = getNestedValue(en, key, returnObjects);
        if (enValue !== undefined) return enValue;
      }
      // Return fallback or the key itself
      return fallback ?? key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isHindi: language === 'hi' }}>
      {children}
    </LanguageContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useLanguage = (): LanguageContextType => {
  return useContext(LanguageContext);
};
