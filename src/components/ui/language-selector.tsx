'use client';

import { useState, useEffect } from 'react';
import { FiGlobe, FiX } from 'react-icons/fi';
import { useDictionary } from '@/hooks/useDictionary';
import { useLanguage } from '@/hooks/useLanguage';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
];

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { dictionary } = useDictionary();
  const { currentLang, changeLanguage } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLanguageChange = (langCode: string) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0];

  if (!mounted) {
    return (
      <div className="p-3 rounded-full bg-gray-100 dark:bg-amber-900/50 border border-gray-200 dark:border-amber-700/50 flex items-center space-x-2">
        <span className="text-lg">🇺🇸</span>
        <span className="text-sm font-medium text-gray-700 dark:text-amber-200">EN</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-3 rounded-full bg-gray-100 dark:bg-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-800/50 border border-gray-200 dark:border-amber-700/50 transition-all duration-300 hover:scale-110 flex items-center space-x-2"
        title="Selecionar idioma"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-amber-200">
          {currentLanguage.code.toUpperCase()}
        </span>
      </button>
        <div className={`fixed inset-0 z-50 w-screen h-screen
           bg-black/50 flex items-center justify-center p-4 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} 
            transition-all duration-300 ease-in-out`}>
          <div className={`bg-white z-50 dark:bg-amber-950 w-screen rounded-2xl shadow-2xl border border-gray-200 dark:border-amber-700/50  max-w-md transition-all duration-300 ease-out ${
            isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
          }`}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-amber-700/50">
              <div className="flex items-center space-x-3">
                <FiGlobe className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {dictionary?.header?.languageSelector?.dropdown?.title}
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-amber-900/50 transition-colors duration-200"
              >
                <FiX className="w-5 h-5 text-gray-500 dark:text-amber-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center space-x-4 ${
                      currentLang === language.code 
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-200' 
                        : 'border-gray-200 dark:border-amber-700/50 hover:border-amber-300 dark:hover:border-amber-600 text-gray-700 dark:text-amber-100 hover:bg-gray-50 dark:hover:bg-amber-900/10'
                    }`}
                  >
                    <span className="text-3xl">{language.flag}</span>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-lg">{language.name}</div>
                      <div className="text-sm opacity-75">
                        {language.code === 'en' ? 'English' : 'Português'}
                      </div>
                    </div>
                    {currentLang === language.code && (
                      <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-amber-700/50 bg-gray-50 dark:bg-amber-950/50 rounded-b-2xl">
              <p className="text-sm text-gray-600 dark:text-amber-400 text-center">
                {dictionary?.header?.languageSelector?.dropdown?.description}
              </p>
            </div>
          </div>
        </div>
    </>
  );
}
