import enUs from '@/dictionaries/en-Us.json';
import ptBr from '@/dictionaries/pt-br.json';

export type Dictionary = typeof enUs;

export type SupportedLanguages = 'en-US' | 'pt-BR';

const dictionaries = {
  'en-US': enUs,
  'pt-BR': ptBr,
} as const;

export async function getDictionary(lang: string): Promise<Dictionary> {
  const normalizedLang = normalizeLanguage(lang);
  
  if (normalizedLang in dictionaries) {
    return dictionaries[normalizedLang as SupportedLanguages];
  }
  
  // Fallback para inglês se o idioma não for suportado
  return dictionaries['en-US'];
}

function normalizeLanguage(lang: string): string {
  // Normaliza diferentes formatos de idioma
  const normalized = lang.toLowerCase().replace('_', '-');
  
  if (normalized.startsWith('pt')) {
    return 'pt-BR';
  }
  
  if (normalized.startsWith('en')) {
    return 'en-US';
  }
  
  return 'en-US'; // Fallback padrão
}

export function getSupportedLanguages(): SupportedLanguages[] {
  return Object.keys(dictionaries) as SupportedLanguages[];
}

export function isValidLanguage(lang: string): boolean {
  const normalizedLang = normalizeLanguage(lang);
  return normalizedLang in dictionaries;
}
