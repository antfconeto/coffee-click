'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/config/firebase';
import { 
  User, 
  onAuthStateChanged, 
  signOut,
  getIdToken,
  getIdTokenResult
} from 'firebase/auth';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  token?: string;
  tokenExpiration?: Date;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: User | null) => {
        setLoading(true);
        
        if (firebaseUser) {
          try {

            const token = await getIdToken(firebaseUser);
            
            const tokenResult = await getIdTokenResult(firebaseUser);
            
            const authUser: AuthUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
              token: token,
              tokenExpiration: new Date(tokenResult.expirationTime)
            };
            
            setUser(authUser);
            setError(null);
          } catch (err: unknown) {
            console.error('Erro ao obter token:', err);
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
            setUser(null);
          }
        } else {
          setUser(null);
          setError(null);
        }
        
        setLoading(false);
      },
      (error) => {
        console.error('Erro na autenticação:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        setUser(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error: unknown) {
      console.error('Erro ao fazer logout:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  const refreshToken = async () => {
    if (!user) return null;
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;
      
      const token = await getIdToken(currentUser, true); // true = force refresh
      const tokenResult = await getIdTokenResult(currentUser);
      
      const updatedUser: AuthUser = {
        ...user,
        token: token,
        tokenExpiration: new Date(tokenResult.expirationTime)
      };
      
      setUser(updatedUser);
      return token;
    } catch (error: unknown) {
      console.error('Erro ao renovar token:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      return null;
    }
  };

  return {
    user,
    loading,
    error,
    logout,
    refreshToken,
    isAuthenticated: !!user
  };
} 