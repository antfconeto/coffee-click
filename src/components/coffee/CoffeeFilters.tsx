'use client';

import {Filter, Search, X } from '@/components/icons';
import { Coffee as CoffeeType } from '@/types/coffee';

interface CoffeeFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedRoastLevel: string;
  setSelectedRoastLevel: (level: string) => void;
  selectedOrigin: string;
  setSelectedOrigin: (origin: string) => void;
  coffees: CoffeeType[];
  onClearFilters: () => void;
}

export function CoffeeFilters({
  searchTerm,
  setSearchTerm,
  selectedRoastLevel,
  setSelectedRoastLevel,
  selectedOrigin,
  setSelectedOrigin,
  coffees,
  onClearFilters
}: CoffeeFiltersProps) {
  const roastLevels = ['light', 'medium', 'dark', 'espresso'];
  const roastLevelLabels = {
    light: 'Claro',
    medium: 'Médio',
    dark: 'Escuro',
    espresso: 'Espresso'
  };

  // Get unique origins from coffees
  const origins = Array.from(new Set(coffees.map(coffee => coffee.origin))).sort();

  const hasActiveFilters = searchTerm || selectedRoastLevel || selectedOrigin;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="h-5 w-5 text-amber-600" />
        <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="ml-auto flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
            <span>Limpar filtros</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar café
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome do café..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Roast Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nível de torra
          </label>
          <select
            value={selectedRoastLevel}
            onChange={(e) => setSelectedRoastLevel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
          >
            <option value="">Todos os níveis</option>
            {roastLevels.map((level) => (
              <option key={level} value={level}>
                {roastLevelLabels[level as keyof typeof roastLevelLabels]}
              </option>
            ))}
          </select>
        </div>

        {/* Origin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Origem
          </label>
          <select
            value={selectedOrigin}
            onChange={(e) => setSelectedOrigin(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
          >
            <option value="">Todas as origens</option>
            {origins.map((origin) => (
              <option key={origin} value={origin}>
                {origin}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
