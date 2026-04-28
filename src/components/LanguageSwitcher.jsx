//src>components>LanguageSwitcher.jsx 

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
  };
  
  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 text-sm font-medium"
      aria-label={t('common.language')}
    >
      <Globe size={16} />
      <span>{i18n.language === 'en' ? '中文' : 'English'}</span>
    </button>
  );
};

export default LanguageSwitcher;