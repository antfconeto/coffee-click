'use client';

import { useState } from 'react';
import { auth } from '@/config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential 
} from 'firebase/auth';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { CookieLogo } from '../ui/header/logos';

export default function CustomLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { lang } = useParams();
  const [error, setError] = useState('');
  const router = useRouter();
  

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result: UserCredential;
      
      if (isSignUp) {
        result = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }
      router.push(`/${lang}/oneboarding`);
    } catch (error: unknown) {
      console.error('Auth error:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign in success:', result.user);
      router.push(`/${lang}/onboarding`);
      } catch (error: unknown) {
      console.error('Google sign in error:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center p-4">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Círculos flutuantes animados */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-amber-200/30 to-orange-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-orange-200/30 to-amber-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-yellow-200/20 to-amber-300/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Partículas decorativas */}
        <div className="absolute top-32 left-1/4 w-2 h-2 bg-amber-400/60 rounded-full animate-bounce"></div>
        <div className="absolute top-48 right-1/3 w-3 h-3 bg-orange-400/60 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-32 left-1/3 w-2 h-2 bg-yellow-400/60 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-48 right-1/4 w-3 h-3 bg-amber-400/60 rounded-full animate-bounce delay-1000"></div>
      </div>

      {/* Card principal */}
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 relative overflow-hidden">
          {/* Decoração interna do card */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/50 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-100/50 to-transparent rounded-full blur-2xl"></div>
          
          {/* Logo e Título */}
          <div className="text-center mb-8 relative z-10">
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-rrounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-white rounded-full p-4 shadow-xl">
                  <CookieLogo size={100} />
                </div>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-800 via-orange-700 to-amber-800 bg-clip-text text-transparent mb-3">
              {isSignUp ? 'Criar Conta' : 'Bem-vindo'}
            </h2>
            
            <p className="text-amber-600/80 text-lg font-medium">
              {isSignUp ? 'Comece sua jornada com o café' : 'Entre para continuar sua experiência'}
            </p>
          </div>
          
          {/* Mensagem de Erro */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 text-red-700 px-6 py-4 rounded-2xl mb-6 text-sm font-medium shadow-lg backdrop-blur-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleEmailAuth} className="space-y-6 relative z-10">
            <div className="group">
              <label htmlFor="email" className="block text-sm font-bold text-amber-800 mb-3 ml-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-amber-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m6.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-amber-200/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/30 focus:border-amber-400 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-amber-400/60 font-medium"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="group">
              <label htmlFor="password" className="block text-sm font-bold text-amber-800 mb-3 ml-1">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-amber-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-amber-200/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/30 focus:border-amber-400 transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-amber-400/60 font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white py-4 px-6 rounded-2xl hover:from-amber-700 hover:via-orange-700 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-amber-500/25 transform hover:-translate-y-1 hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Carregando...
                  </div>
                ) : (
                  isSignUp ? 'Criar Conta' : 'Entrar'
                )}
              </span>
            </button>
          </form>

          {/* Divisor elegante */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/95 text-amber-600 font-semibold text-lg">ou</span>
            </div>
          </div>

          {/* Botão Google estilizado */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full group relative bg-white border-2 border-amber-200/50 text-amber-800 py-4 px-6 rounded-2xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl hover:border-amber-300 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-100/20 to-orange-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            <svg className="w-6 h-6 mr-4 relative z-10" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="relative z-10 text-lg">Continuar com Google</span>
          </button>

          {/* Alternar entre Login/Signup */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-amber-700 hover:text-amber-900 text-base font-semibold transition-all duration-300 hover:scale-105 transform"
            >
              {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem uma conta? Criar conta'}
            </button>
          </div>
        </div>
      </div>

      {/* Elementos decorativos flutuantes */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-amber-300/40 to-orange-400/40 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-20 left-20 w-16 h-16 bg-gradient-to-tr from-orange-300/40 to-amber-400/40 rounded-full blur-xl animate-float-delayed"></div>
      <div className="absolute top-1/3 right-16 w-12 h-12 bg-gradient-to-bl from-yellow-300/40 to-amber-400/40 rounded-full blur-xl animate-float-slow"></div>
    </div>
  );
} 