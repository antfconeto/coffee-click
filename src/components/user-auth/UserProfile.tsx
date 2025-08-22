'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { userApi } from '@/api/user';
import { coffeeApi } from '@/api/coffee';
import { User } from '@/types/user';
import { Coffee, ListCoffeesResponse } from '@/types/coffee';
import { Button } from '@/components/ui/button';
import CoffeeLoader from '@/components/ui/loaders/coffee-loader';
import { Header } from '../layout/header/Header';
import Image from 'next/image';
import { CoffeeCard } from '@/components/coffee/CoffeeCard';

// Tipo específico para a resposta da API listCoffeeByUserId
type UserCoffeesResponse = {
  items: Coffee[];
  nextToken?: string;
};

export default function UserProfile() {
  const { user: authUser, loading: authLoading, logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'coffees'>('profile');
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    photoUrl: ''
  });

  // Estados para cafés
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [coffeesLoading, setCoffeesLoading] = useState(false);
  const [coffeesError, setCoffeesError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);
  const [hasMoreCoffees, setHasMoreCoffees] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (authUser?.uid && authUser?.token) {
        try {
          setLoading(true);
          const userData = await userApi.getUserById(authUser.uid, authUser.token);
          setUser(userData);
          setEditForm({
            name: userData.name || '',
            photoUrl: userData.photoUrl || ''
          });
          setError(null);
        } catch (err) {
          console.error('Erro ao buscar usuário:', err);
          setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUser();
  }, [authUser]);

  // Função para buscar cafés do usuário
  const fetchUserCoffees = async (isLoadMore = false) => {
    if (!authUser?.uid || !authUser?.token) return;
    try {
      setCoffeesLoading(true);
      setCoffeesError(null);
      
      const response = await coffeeApi.listCoffeeByUserId(
        authUser.uid, 
        10, // limit
        isLoadMore ? nextToken || '' : ''
      ) as unknown as UserCoffeesResponse;
      
      // A API retorna { items, nextToken }
      const coffeeItems = response.items || [];
      const responseNextToken = response.nextToken;
      
      if (isLoadMore) {
        setCoffees(prev => [...prev, ...coffeeItems]);
      } else {
        setCoffees(coffeeItems);
      }
      
      setNextToken(responseNextToken);
      setHasMoreCoffees(!!responseNextToken);
    } catch (err) {
      console.error('Erro ao buscar cafés do usuário:', err);
      setCoffeesError(err instanceof Error ? err.message : 'Erro ao carregar cafés');
    } finally {
      setCoffeesLoading(false);
    }
  };

  // Buscar cafés quando mudar para a seção de cafés
  useEffect(() => {
    if (activeSection === 'coffees' && authUser?.uid && authUser?.token) {
      fetchUserCoffees();
    }
  }, [activeSection, authUser]);

  const handleLoadMore = () => {
    if (hasMoreCoffees && !coffeesLoading) {
      fetchUserCoffees(true);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-amber-950 flex items-center justify-center">
        <CoffeeLoader />
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-amber-950 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white dark:bg-amber-950 rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-amber-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400 dark:text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-amber-100 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 dark:text-amber-200 mb-6 text-sm">Você precisa fazer login para acessar seu perfil.</p>
          <Button 
            onClick={() => window.location.href = '/login'}
            className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white text-sm"
          >
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-amber-950 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white dark:bg-amber-950 rounded-lg shadow-sm p-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-amber-100 text-center mb-4">Erro</h2>
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md mb-6 text-sm">
            {error}
          </div>
          <Button 
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 hover:bg-red-700 text-white text-sm"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setEditForm({
      name: user?.name || '',
      photoUrl: user?.photoUrl || ''
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!user || !authUser?.token) return;
    
    try {
      const updatedUser = await userApi.updateUser({
        ...user,
        name: editForm.name,
        photoUrl: editForm.photoUrl
      }, authUser.token);
      
      setUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      {/* Header do Perfil */}
      <div className="bg-white dark:bg-amber-950 rounded-xl shadow-sm border border-gray-200 dark:border-amber-700 p-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
          {/* Foto do Perfil */}
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-amber-800 dark:to-amber-900 rounded-full flex items-center justify-center overflow-hidden border-4 border-white dark:border-amber-600 shadow-lg">
              {user?.photoUrl ? (
                <Image 
                  src={user.photoUrl} 
                  alt="Foto do perfil" 
                  className="w-full h-full object-cover"
                  width={96}
                  height={96}
                />
              ) : (
                <svg className="w-12 h-12 text-gray-400 dark:text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 bg-gray-900 dark:bg-amber-600 text-white p-2 rounded-full hover:bg-gray-800 dark:hover:bg-amber-700 transition-colors shadow-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>

          {/* Informações Principais */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-amber-100 mb-2">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full text-2xl font-semibold text-gray-900 dark:text-amber-100 bg-transparent border-b-2 border-gray-300 dark:border-amber-600 focus:border-gray-500 dark:focus:border-amber-400 outline-none text-center lg:text-left"
                  placeholder="Seu nome"
                />
              ) : (
                user?.name || 'Usuário'
              )}
            </h1>
            <p className="text-gray-600 dark:text-amber-200 mb-4">{user?.email}</p>
            
            {isEditing && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500 dark:text-amber-300 mb-2">URL da Foto</label>
                <input
                  type="url"
                  value={editForm.photoUrl}
                  onChange={(e) => setEditForm({...editForm, photoUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-amber-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-amber-400 focus:border-transparent text-sm bg-white dark:bg-amber-800 text-gray-900 dark:text-amber-100"
                  placeholder="https://exemplo.com/foto.jpg"
                />
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {user?.role || 'Usuário'}
              </span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col space-y-3">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleSave}
                  className="bg-gray-900 hover:bg-gray-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white px-6 text-sm"
                >
                  Salvar
                </Button>
                <Button 
                  onClick={handleCancel}
                  variant="outline"
                  className="px-6 text-sm border-gray-300 dark:border-amber-600 text-gray-700 dark:text-amber-200 hover:bg-gray-50 dark:hover:bg-amber-800"
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button 
                onClick={handleEdit}
                className="bg-gray-900 hover:bg-gray-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white px-6 text-sm"
              >
                Editar Perfil
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Informações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Pessoais */}
        <div className="bg-white dark:bg-amber-950 rounded-xl shadow-sm border border-gray-200 dark:border-amber-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-amber-100 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-gray-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Informações Pessoais
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-amber-300 mb-1">Nome</label>
              <p className="text-gray-900 dark:text-amber-100 font-medium">{user?.name || 'Não informado'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-amber-300 mb-1">Email</label>
              <p className="text-gray-900 dark:text-amber-100 font-medium">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-amber-300 mb-1">Função</label>
              <p className="text-gray-900 dark:text-amber-100 font-medium">{user?.role || 'Não informado'}</p>
            </div>
          </div>
        </div>

        {/* Informações da Conta */}
        <div className="bg-white dark:bg-amber-950 rounded-xl shadow-sm border border-gray-200 dark:border-amber-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-amber-100 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-gray-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Detalhes da Conta
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-amber-300 mb-1">Criado em</label>
              <p className="text-gray-900 dark:text-amber-100 font-medium">{formatDate(user?.createdAt)}</p>
            </div>
            {user?.updatedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-amber-300 mb-1">Atualizado em</label>
                <p className="text-gray-900 dark:text-amber-100 font-medium">{formatDate(user.updatedAt)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCoffeesSection = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-amber-950 rounded-xl shadow-sm border border-gray-200 dark:border-amber-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-amber-100">Meus Cafés</h2>
          <Button
            onClick={() => window.location.href = '/pt/coffee/create'}
            className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Novo Café
          </Button>
        </div>

        {coffeesLoading && coffees.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <CoffeeLoader />
          </div>
        ) : coffeesError ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 dark:text-red-400 mb-4">{coffeesError}</p>
            <Button
              onClick={() => fetchUserCoffees()}
              variant="outline"
              className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400"
            >
              Tentar Novamente
            </Button>
          </div>
        ) : coffees.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-amber-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400 dark:text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-amber-100 mb-2">Nenhum café encontrado</h3>
            <p className="text-gray-500 dark:text-amber-300 mb-6">Você ainda não criou nenhum café. Comece criando seu primeiro!</p>
            <Button
              onClick={() => window.location.href = '/pt/coffee/create'}
              className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white"
            >
              Criar Primeiro Café
            </Button>
          </div>
        ) : (
          <>
            {/* Grid de Cafés usando CoffeeCard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {coffees.map((coffee) => (
                <CoffeeCard
                  key={coffee.id}
                  coffee={coffee}
                  onAddToCart={(coffee) => {
                    // Função placeholder para adicionar ao carrinho
                    console.log('Adicionando ao carrinho:', coffee);
                    // TODO: Implementar funcionalidade do carrinho
                  }}
                />
              ))}
            </div>

            {/* Botão Carregar Mais */}
            {hasMoreCoffees && (
              <div className="text-center">
                <Button
                  onClick={handleLoadMore}
                  disabled={coffeesLoading}
                  variant="outline"
                  className="border-amber-300 dark:border-amber-600 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-800"
                >
                  {coffeesLoading ? (
                    <>
                      <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Carregando...
                    </>
                  ) : (
                    'Carregar Mais Cafés'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-amber-950">
        {/* Layout Desktop - Menu Lateral */}
        <div className="hidden lg:flex">
          {/* Menu Lateral */}
          <div className="w-64 bg-white dark:bg-amber-950 shadow-sm border-r border-gray-200 dark:border-amber-700 min-h-screen p-6">
            <div className="space-y-6">
              {/* Foto e Nome do Usuário */}
              <div className="text-center pb-6 border-b border-gray-200 dark:border-amber-700">
                <div className="w-20 h-20 hover:scale-110 hover:border-amber-700 dark:hover:border-amber-400 transition-all duration-300 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-amber-800 dark:to-amber-900 rounded-full flex items-center justify-center overflow-hidden border-4 border-white dark:border-amber-600 shadow-lg mx-auto mb-4">
                  {user?.photoUrl ? (
                    <Image 
                      src={user.photoUrl} 
                      alt="Foto do perfil" 
                      className="w-full h-full object-cover hover:scale-110 transition-all duration-300"
                      width={80}
                      height={80}
                    />
                  ) : (
                    <svg className="w-10 h-10 text-gray-400 dark:text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-amber-100">{user?.name || 'Usuário'}</h3>
                <p className="text-sm text-gray-500 dark:text-amber-300">{user?.email}</p>
              </div>

              {/* Menu de Navegação */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveSection('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'profile'
                      ? 'bg-amber-600 text-white dark:bg-amber-500'
                      : 'text-gray-700 dark:text-amber-200 hover:bg-gray-100 dark:hover:bg-amber-800'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Perfil
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveSection('coffees')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === 'coffees'
                      ? 'bg-amber-600 text-white dark:bg-amber-500'
                      : 'text-gray-700 dark:text-amber-200 hover:bg-gray-100 dark:hover:bg-amber-800'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Meus Cafés
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Conteúdo Principal Desktop */}
          <div className="flex-1 p-8">
            {/* Header com Dropdown de Ações */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-amber-100">
                {activeSection === 'profile' ? 'Meu Perfil' : 'Meus Cafés'}
              </h1>
              
              {/* Dropdown de Ações */}
              <div className="relative">
                <button
                  onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                  className="p-2 text-gray-600 dark:text-amber-200 hover:text-gray-900 dark:hover:text-amber-100 hover:bg-gray-100 dark:hover:bg-amber-800 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                
                {showActionsDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-amber-950 rounded-lg shadow-lg border border-gray-200 dark:border-amber-700 py-2 z-50">
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sair da Conta
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Conteúdo da Seção Ativa */}
            {activeSection === 'profile' ? renderProfileSection() : renderCoffeesSection()}
          </div>
        </div>

        {/* Layout Mobile - Menu Inferior */}
        <div className="lg:hidden">
          {/* Conteúdo Principal Mobile */}
          <div className="pb-20"> {/* Espaço para o menu inferior */}
            {/* Header Mobile */}
            <div className="bg-white dark:bg-amber-950 border-b border-gray-200 dark:border-amber-700 p-4">
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-amber-100">
                  {activeSection === 'profile' ? 'Meu Perfil' : 'Meus Cafés'}
                </h1>
                
                {/* Dropdown de Ações Mobile */}
                <div className="relative">
                  <button
                    onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                    className="p-2 text-gray-600 dark:text-amber-200 hover:text-gray-900 dark:hover:text-amber-100 hover:bg-gray-100 dark:hover:bg-amber-800 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                  
                  {showActionsDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-amber-950 rounded-lg shadow-lg border border-gray-200 dark:border-amber-700 py-2 z-50">
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sair da Conta
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Conteúdo da Seção Ativa Mobile */}
            <div className="p-4">
              {activeSection === 'profile' ? renderProfileSection() : renderCoffeesSection()}
            </div>
          </div>

          {/* Menu Inferior Mobile */}
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-amber-950 border-t border-gray-200 dark:border-amber-700 z-50">
            {/* Foto e Nome do Usuário */}
            <div className="text-center py-3 border-b border-gray-200 dark:border-amber-700">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-amber-800 dark:to-amber-900 rounded-full flex items-center justify-center overflow-hidden border-2 border-white dark:border-amber-600">
                  {user?.photoUrl ? (
                    <Image 
                      src={user.photoUrl} 
                      alt="Foto do perfil" 
                      className="w-full h-full object-cover"
                      width={32}
                      height={32}
                    />
                  ) : (
                    <svg className="w-4 h-4 text-gray-400 dark:text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-amber-100">{user?.name || 'Usuário'}</h3>
                  <p className="text-xs text-gray-500 dark:text-amber-300">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Menu de Navegação Mobile */}
            <nav className="flex">
              <button
                onClick={() => setActiveSection('profile')}
                className={`flex-1 flex flex-col items-center py-3 px-2 transition-colors ${
                  activeSection === 'profile'
                    ? 'bg-amber-600 text-white dark:bg-amber-500'
                    : 'text-gray-700 dark:text-amber-200 hover:bg-gray-100 dark:hover:bg-amber-800'
                }`}
              >
                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs font-medium">Perfil</span>
              </button>
              
              <button
                onClick={() => setActiveSection('coffees')}
                className={`flex-1 flex flex-col items-center py-3 px-2 transition-colors ${
                  activeSection === 'coffees'
                    ? 'bg-amber-600 text-white dark:bg-amber-500'
                    : 'text-gray-700 dark:text-amber-200 hover:bg-gray-100 dark:hover:bg-amber-800'
                }`}
              >
                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-xs font-medium">Meus Cafés</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
} 