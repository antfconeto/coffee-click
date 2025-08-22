'use client';

import { useState, useEffect, useMemo } from 'react';
import { Coffee } from '@/types/coffee';
import { coffeeApi } from '@/api/coffee';
import { useAuthContext } from '@/contexts/AuthContext';

export function useCoffees() {
  const [coffees, setCoffees] = useState<Coffee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoastLevel, setSelectedRoastLevel] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('');
  
  const { user } = useAuthContext();


  const fetchCoffees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await coffeeApi.listCoffees(user?.token);
      setCoffees(response.listCoffees.items || []);
    } catch (err:  unknown) {
      console.error('Erro ao buscar cafés:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoffees();
  }, [user?.token]);


  const filteredCoffees = useMemo(() => {
    return coffees.filter((coffee) => {
      const matchesSearch = searchTerm === '' || 
        coffee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coffee.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRoastLevel = selectedRoastLevel === '' || 
        coffee.roastLevel === selectedRoastLevel;
      
      const matchesOrigin = selectedOrigin === '' || 
        coffee.origin === selectedOrigin;
      
      return matchesSearch && matchesRoastLevel && matchesOrigin;
    });
  }, [coffees, searchTerm, selectedRoastLevel, selectedOrigin]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRoastLevel('');
    setSelectedOrigin('');
  };

  // Add to cart function (placeholder for now)
  const addToCart = (coffee: Coffee) => {
    console.log('Adicionando ao carrinho:', coffee);
    // TODO: Implement cart functionality
  };

  return {
    coffees: filteredCoffees,
    allCoffees: coffees,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedRoastLevel,
    setSelectedRoastLevel,
    selectedOrigin,
    setSelectedOrigin,
    clearFilters,
    addToCart,
    refetch: fetchCoffees
  };
}
