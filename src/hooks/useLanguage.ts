'use client';

import { useRouter, useParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export function useLanguage() {
  const router = useRouter();
  const params = useParams();
  
  const currentLang = useMemo(() => params?.lang as string || 'en', [params?.lang]);
  
  const changeLanguage = useCallback((newLang: string) => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const newPath = currentPath.replace(`/${currentLang}`, `/${newLang}`);
      router.push(newPath);
    }
  }, [currentLang, router]);
  
  const getLanguagePath = useCallback((lang: string) => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      return currentPath.replace(`/${currentLang}`, `/${lang}`);
    }
    return `/${lang}`;
  }, [currentLang]);
  
  return {
    currentLang,
    changeLanguage,
    getLanguagePath,
  };
}
