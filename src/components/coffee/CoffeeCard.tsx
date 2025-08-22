'use client';

import { Coffee } from '@/types/coffee';
import { MapPin, Package, Star, ShoppingCart } from '@/components/icons';
import { Carrousel } from '@/components/ui/carrousels/carrousel';
import Image from 'next/image';

interface CoffeeCardProps {
  coffee: Coffee;
  onAddToCart: (coffee: Coffee) => void;
}

export function CoffeeCard({ coffee, onAddToCart }: CoffeeCardProps) {
  const getRoastLevelColor = (roastLevel: string) => {
    switch (roastLevel) {
      case 'light':
        return 'bg-amber-100 text-amber-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'dark':
        return 'bg-red-100 text-red-800';
      case 'espresso':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoastLevelText = (roastLevel: string) => {
    switch (roastLevel) {
      case 'light':
        return 'Claro';
      case 'medium':
        return 'Médio';
      case 'dark':
        return 'Escuro';
      case 'espresso':
        return 'Espresso';
      default:
        return roastLevel;
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD'
    }).format(price);
  };

  const formatWeight = (weight: number, unit: string) => {
    if (unit === 'kg') {
      return `${weight}kg`;
    }
    return `${weight}g`;
  };

  return (
    <div className="bg-white dark:bg-amber-900 rounded-xl shadow-sm border border-gray-100 dark:border-amber-900 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Image Carousel */}
      <div className="relative h-48 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900 dark:to-amber-900">
        {coffee.medias && coffee.medias.length > 0 ? (
          <div className="relative">
            <Carrousel
              images={coffee.medias.map(media => media.mediaUrl)}
              autoPlay={false}
              showIndicators={coffee.medias.length > 1}
              showArrows={coffee.medias.length > 1}
              showInfoCard={false}
              height="h-48"
              className="rounded-t-xl"
              supportVideos={true}
            />

            {/* Roast Level Badge */}
            <div className={`absolute top-3 left-3 z-20 px-2 py-1 rounded-full text-xs font-medium ${getRoastLevelColor(coffee.roastLevel)}`}>
              {getRoastLevelText(coffee.roastLevel)}
            </div>

            {/* Stock Badge */}
            {!coffee.isAvailable && (
              <div className="absolute top-3 right-3 z-20 px-2 py-1 dark:bg-red-100 dark:text-red-800 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                Sem estoque
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-amber-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Price */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-amber-400 line-clamp-2">
            {coffee.name}
          </h3>
          <div className="text-right">
            <p className="text-xl font-bold text-amber-600 dark:text-amber-300">
              {formatPrice(coffee.price, coffee.currency)}
            </p>
            <p className="text-sm text-gray-500 dark:text-amber-400">
              {formatWeight(coffee.weight, coffee.weightUnit)}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-amber-400 text-sm mb-3 line-clamp-2">
          {coffee.description}
        </p>

        {/* Origin */}
        <div className="flex items-center text-sm text-gray-500 mb-3 dark:text-white">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{coffee.origin}</span>
        </div>

        {/* Categories */}
        {coffee.categories && coffee.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 dark:text-white">
            {coffee.categories.slice(0, 3).map((category) => (
              <div 
                key={category.id}
                className="flex items-center justify-center p-1 bg-gray-100 dark:bg-amber-950 rounded-full"
              >
                <span className="material-symbols-outlined text-amber-500">
                  {category.icon}
                </span>
                <span className="px-2 py-1 text-gray-700 dark:text-white text-xs">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        )}
      
        {/* Seller */}
        <div className="flex items-center space-x-2 mb-4">
          {coffee.seller.photoUrl ? (
            <Image
              src={coffee.seller.photoUrl}
              alt={coffee.seller.name}
              className="h-6 w-6 rounded-full object-cover"
              width={24}
              height={24}
            />
          ) : (
            <div className="h-6 w-6 bg-gradient-to-r dark:from-amber-500 dark:to-orange-500 from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
              <Star className="h-3 w-3 text-white" />
            </div>
          )}
          <span className="text-sm text-gray-600 dark:text-white">{coffee.seller.name}</span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(coffee)}
          disabled={!coffee.isAvailable}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${coffee.isAvailable
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
        >
          {coffee.isAvailable ? (
            <div className="flex items-center justify-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>Adicionar ao Carrinho</span>
            </div>
          ) : (
            'Indisponível'
          )}
        </button>
      </div>
    </div>
  );
}
