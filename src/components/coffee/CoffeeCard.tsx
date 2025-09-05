'use client';

import { Coffee } from '@/types/coffee';
import { MapPin, Package, Star, Eye, MoreVertical, Edit, Trash } from '@/components/icons';
import { Carrousel } from '@/components/ui/carrousels/carrousel';
import { useAuthContext } from '@/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CoffeeCardProps {
  coffee: Coffee;
  onViewDetails?: (coffee: Coffee) => void;
  onUpdate?: (coffee: Coffee) => void;
  onDelete?: (coffee: Coffee) => void;
  lang?: string;
}

export function CoffeeCard({ 
  coffee, 
  onViewDetails, 
  onUpdate, 
  onDelete, 
  lang = 'pt-br' 
}: CoffeeCardProps) {
  const { user } = useAuthContext();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Verificar se o usuário é dono do café
  const isOwner = user?.uid === coffee.seller.id;
  
  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(coffee);
    } else {
      router.push(`/${lang}/coffee/${coffee.id}`);
    }
  };
  
  const handleUpdate = () => {
    setShowDropdown(false);
    if (onUpdate) {
      onUpdate(coffee);
    } else {
      router.push(`/${lang}/coffee/${coffee.id}/update`);
    }
  };
  
  const handleDelete = () => {
    setShowDropdown(false);
    if (onDelete) {
      onDelete(coffee);
    }
  };
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

  const renderStars = (rating: number, reviewsCount: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="h-4 w-4 text-amber-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative h-4 w-4">
            <Star className="h-4 w-4 text-gray-300 absolute" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${(rating % 1) * 100}%` }}>
              <Star className="h-4 w-4 text-amber-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="h-4 w-4 text-gray-300" />
        );
      }
    }

    return (
      <div className="flex items-center space-x-1 mb-3">
        <div className="flex items-center">
          {stars}
        </div>
        <span className="text-sm text-gray-600 dark:text-amber-400 ml-2">
          {rating.toFixed(1)} ({reviewsCount} {reviewsCount === 1 ? 'avaliação' : 'avaliações'})
        </span>
      </div>
    );
  };

  return (
    <div className="relative bg-white dark:bg-amber-950 rounded-xl shadow-sm border border-gray-100 dark:border-amber-900 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      {/* Image Carousel */}
      <div className="relative h-48 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-amber-900">
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

            {/* Owner Dropdown Menu */}
            {isOwner && (
              <div className="absolute top-3 right-3 z-30" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-1 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
                >
                  <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                    <button
                      onClick={handleViewDetails}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Ver Detalhes</span>
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Atualizar</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                    >
                      <Trash className="h-4 w-4" />
                      <span>Deletar</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Stock Badge */}
            {!coffee.isAvailable && (
              <div className={`absolute top-3 ${isOwner ? 'right-16' : 'right-3'} z-20 px-2 py-1 dark:bg-red-100 dark:text-red-800 bg-red-100 text-red-800 rounded-full text-xs font-medium`}>
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
      <div className="flex flex-col flex-1 p-4">
        {/* Main Content */}
        <div className="flex-1">
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

        {/* Rating */}
        {coffee.review && coffee.review.globalRating > 0 && 
          renderStars(coffee.review.globalRating, coffee.review.reviews.length)
        }

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
        </div>

        {/* View Details Button - Always at bottom */}
        <div className="mt-auto">
          <button
            onClick={handleViewDetails}
            className="w-full py-2 px-4 rounded-lg font-medium transition-colors bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
          >
            <div className="flex items-center justify-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Ver Detalhes</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
