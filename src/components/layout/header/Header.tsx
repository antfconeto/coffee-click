'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { User } from '@/components/icons';
import {  FiSun, FiMoon, FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import { useEffect, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import {CookieLogo} from '@/components/ui/header/logos';
import { useDictionary } from '@/hooks/useDictionary';
import { LanguageSelector } from '@/components/ui/language-selector';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';


export function Header() {
  const { user, logout, loading: authLoading } = useAuthContext();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { dictionary, loading } = useDictionary();
  const router = useRouter();
  const { lang } = useParams();

  // Garantir que o componente seja montado apenas no cliente
  useEffect(() => setMounted(true), []);

  // Fechar menu quando o usuário mudar
  useEffect(() => {
    setShowUserMenu(false);
  }, [user]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setShowUserMenu(false);
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, [logout, router]);

  // Renderizar loading enquanto não estiver montado ou enquanto estiver carregando autenticação
  if (!mounted || authLoading) {
    return (
      <header className="bg-white/95 transition-all duration-300 ease-in-out max-md:h-16 dark:bg-amber-950/95 backdrop-blur-sm shadow-lg border-b border-gray-200/50 dark:border-amber-800/30 h-20 px-6">
        <div className="flex items-center justify-between h-full max-w-7xl mx-auto">
          <div className="flex items-center justify-center">
            <div className="p-2 rounded-full flex justify-center items-center">
              <CookieLogo size={60} />
            </div>
          </div>
        </div>
      </header>
    );
  } 

  const getFirstName = (displayName: string | null) => {
    if (!displayName) return dictionary?.header?.user?.defaultName || 'User';
    return displayName.split(' ')[0];
  };

  return (
    <header className="bg-white/95 transition-all relative z-10 duration-300 ease-in-out max-md:h-16 dark:bg-amber-950/95 backdrop-blur-sm shadow-lg border-b border-gray-200/50 dark:border-amber-800/30 h-20 px-6">
      
      <div className="flex items-center justify-between h-full max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center group cursor-pointer">
          {/* Ícone */}
          <div className="p-2 rounded-full flex justify-center items-center transition-all duration-300">
            <CookieLogo size={60} />
          </div>

          {/* Texto que alterna */}
          <div className="relative ml-2 h-[28px] flex items-center overflow-hidden transition-all max-md:w-[50] duration-500 w-[38px] group-hover:w-[150px]">
            {/* Texto completo (mostra no hover) */}
            <span className="absolute left-0 max-md:hidden max-md:text-lg text-2xl font-serif  font-bold bg-[#c9aa6c] dark:bg-[#eecf93] bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap max-md:opacity-100 max-md:">
              {loading ? (dictionary?.common?.loading || 'Loading...') : dictionary?.header?.logo?.brand || 'Coffee Click'}
            </span>

            {/* Texto curto (mostra sem hover) */}
            <span className="absolute left-0  text-2xl font-serif font-bold bg-[#c9aa6c] dark:bg-[#eecf93] bg-clip-text text-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300">
              CC
            </span>
          </div>
        </div>
        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center space-x-8">
          {[
            { key: 'home', label: dictionary?.header?.navigation?.home || 'Home',href: `/${lang}/home` },
            { key: 'products', label: dictionary?.header?.navigation?.products || 'Products', href: `/${lang}/products` },
            { key: 'contacts', label: dictionary?.header?.navigation?.contacts || 'Contacts', href: `/${lang}/contacts` },
            { key: 'social', label: dictionary?.header?.navigation?.social || 'Social', href: `/${lang}/social` }
          ].map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="relative text-gray-700 font-serif dark:text-amber-100 font-medium hover:text-amber-600 dark:hover:text-amber-300 transition-colors duration-200 group"
            >
              {item.label}
              <span className="absolute  -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-600 group-hover:w-full transition-all duration-300"></span>
            </a>
          ))}
        </nav>
        <div className='flex items-center space-x-5'>
          {/* Language Selector */}
          <LanguageSelector />
          
          {/* Theme Toggle */}
          <button
            className="relative p-3 rounded-full max-md:p-2 bg-gray-100 dark:bg-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-800/50 border border-gray-200 dark:border-amber-700/50 transition-all duration-300 hover:scale-110 hover:shadow-md group"
            onClick={() => setTheme(theme !== "dark" ? "dark" : "light")}
          >
            {theme === "dark" ? (
              <FiMoon className='h-5 w-5 max-md:h-4 max-md:w-4 text-amber-200 group-hover:text-amber-100 transition-colors duration-200' />
            ) : (
              <FiSun className="h-5 w-5  max-md:h-4 max-md:w-4 text-amber-600 group-hover:text-amber-700 transition-colors duration-200" />
            )}
          </button>
          
          {/* User Profile Dropdown */}
          <div className="relative">
            <div 
              className="flex items-center space-x-3 max-md:space-x-2 group cursor-pointer"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="relative">
                {user!.photoURL ? (
                  <Image
                    src={user!.photoURL}
                    alt="User"
                    className='h-12 w-12 max-md:h-10 max-md:w-10 rounded-full border-2 border-gray-200 dark:border-amber-700/50 group-hover:border-amber-500 dark:group-hover:border-amber-400 transition-all duration-300 shadow-md group-hover:shadow-lg'
                    width={100}
                    height={100}
                    />
                ) : (
                  <div className='h-12 w-12 max-md:h-10 max-md:w-10 rounded-full border-2 border-gray-200 dark:border-amber-700/50 bg-gray-300 dark:bg-amber-800 flex items-center justify-center'>
                    <User className="h-6 w-6 text-gray-600 dark:text-amber-300" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-amber-950 rounded-full"></div>
              </div>
              <span className="text-gray-800 font-serif max-md:hidden dark:text-amber-100 font-semibold group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors duration-200">
                {getFirstName(user!.displayName!) || 'User'}
              </span>
            </div>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-amber-950 rounded-lg shadow-xl border border-gray-200 dark:border-amber-700/50 py-2 z-50">
                <Link 
                  href={`/${lang}/profile`}
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-amber-100 hover:bg-amber-50 dark:hover:bg-amber-900/50 transition-colors duration-200"
                  onClick={() => setShowUserMenu(false)}
                >
                  <FiUser className="w-4 h-4 mr-3 text-amber-600" />
                  Meu Perfil
                </Link>
                
                <Link 
                  href={`/${lang}/settings`}
                  className="flex items-center px-4 py-2 text-gray-700 dark:text-amber-100 hover:bg-amber-50 dark:hover:bg-amber-900/50 transition-colors duration-200"
                  onClick={() => setShowUserMenu(false)}
                >
                  <FiSettings className="w-4 h-4 mr-3 text-amber-600" />
                  Configurações
                </Link>
                
                <hr className="my-2 border-gray-200 dark:border-amber-700/50" />
                
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                >
                  <FiLogOut className="w-4 h-4 mr-3" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Overlay para fechar o menu quando clicar fora */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}
