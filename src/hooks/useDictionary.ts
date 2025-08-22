'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getDictionary, type Dictionary } from '@/lib/dictionary';

export function useDictionary() {
  const params = useParams();
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function loadDictionary() {
      try {
        const lang = params?.lang as string;
        if (lang && mounted) {
          const dict = await getDictionary(lang);
          if (mounted) {
            setDictionary(dict);
            setLoading(false);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load dictionary');
          setLoading(false);
        }
      }
    }

    if (params?.lang) {
      loadDictionary();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [params?.lang]);

  return {
    dictionary,
    loading,
    error,
    lang: params?.lang as string,
  };
}
