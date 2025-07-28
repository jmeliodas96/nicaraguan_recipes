import React, { useState, createContext, useContext } from 'react';
import esTranslations from '../translations/es';
import enUKTranslations from '../translations/en_UK';

const allTranslations = {
  es: esTranslations,
  en_UK: enUKTranslations,
};

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en_UK');
  const t = allTranslations[language];

  const toggleLanguage = () => {
    setLanguage(prevLang => (prevLang === 'es' ? 'en_UK' : 'es'));
  };

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);