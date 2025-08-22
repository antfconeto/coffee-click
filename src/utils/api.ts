import { auth } from '@/config/firebase';
import { getIdToken } from 'firebase/auth';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

export async function authenticatedApiCall(
  url: string, 
  options: ApiOptions = {}
) {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    // Obter token atual
    const token = await getIdToken(currentUser);
    
    const { method = 'GET', body, headers = {} } = options;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na requisição autenticada:', error);
    throw error;
  }
}

// Exemplos de uso:
export const api = {
  // GET com autenticação
  get: (url: string, headers?: Record<string, string>) =>
    authenticatedApiCall(url, { method: 'GET', headers }),

  // POST com autenticação
  post: (url: string, body: unknown, headers?: Record<string, string>) =>
    authenticatedApiCall(url, { method: 'POST', body, headers }),

  // PUT com autenticação
  put: (url: string, body: unknown, headers?: Record<string, string>) =>
    authenticatedApiCall(url, { method: 'PUT', body, headers }),

  // DELETE com autenticação
  delete: (url: string, headers?: Record<string, string>) =>
    authenticatedApiCall(url, { method: 'DELETE', headers }),
}; 