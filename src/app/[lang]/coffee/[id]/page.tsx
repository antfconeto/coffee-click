'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header/Header';
import { Carrousel } from '@/components/ui/carrousels/carrousel';
import { coffeeApi } from '@/api/coffee';
import { Coffee } from '@/types/coffee';
import { useDictionary } from '@/hooks/useDictionary';
import { useAuthContext } from '@/contexts/AuthContext';
import { 
  FiArrowLeft, 
  FiMapPin, 
  FiPackage, 
  FiStar, 
  FiShoppingCart, 
  FiUser,
  FiTrendingUp,
  FiCoffee,
  FiDollarSign,
  FiBox,
  FiTag,
  FiHeart,
  FiShare2,
  FiPlus,
  FiMinus,
  FiZoomIn,
  FiHome,
  FiChevronRight,
  FiTruck,
  FiShield,
  FiAward,
  FiClock,
  FiX
} from 'react-icons/fi';
import Image from 'next/image';

export default function CoffeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { dictionary, loading: dictLoading } = useDictionary();
  const { user } = useAuthContext();
  
  const [coffee, setCoffee] = useState<Coffee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);
  const [relatedCoffees, setRelatedCoffees] = useState<Coffee[]>([]);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const coffeeId = params?.id as string;

  useEffect(() => {
    if (!coffeeId) return;

    const fetchCoffee = async () => {
      try {
        setLoading(true);
        setError(null);
        const coffeeData = await coffeeApi.getCoffeeById(coffeeId);
        setCoffee(coffeeData);
        
        // Fetch related coffees
        try {
          const allCoffeesResponse = await coffeeApi.listCoffees();
          const relatedCoffeesData = allCoffeesResponse.listCoffees.items
            .filter(c => c.id !== coffeeId && c.isAvailable)
            .slice(0, 4); // Limite de 4 cafés relacionados
          setRelatedCoffees(relatedCoffeesData);
        } catch (relatedErr) {
          console.warn('Erro ao buscar cafés relacionados:', relatedErr);
        }
      } catch (err) {
        console.error('Erro ao buscar café:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar café');
      } finally {
        setLoading(false);
      }
    };

    fetchCoffee();
  }, [coffeeId]);

  // Close share menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddToCart = () => {
    if (!coffee) return;
    console.log(`Adicionando ${quantity}x ${coffee.name} ao carrinho`);
    // TODO: Implement cart functionality with quantity
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (coffee?.stockQuantity || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorites API call
  };

  const handleImageZoom = (imageIndex: number) => {
    setZoomImageIndex(imageIndex);
    setShowImageZoom(true);
  };

  const handleShare = (platform?: string) => {
    if (platform && coffee) {
      const url = window.location.href;
      const text = `Confira este café incrível: ${coffee.name}`;
      
      switch (platform) {
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
          break;
        case 'copy':
          navigator.clipboard.writeText(url);
          alert('Link copiado para a área de transferência!');
          break;
      }
      setShowShareMenu(false);
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  // Memoized calculations
  const totalPrice = useMemo(() => {
    return coffee ? coffee.price * quantity : 0;
  }, [coffee?.price, quantity]);

  const breadcrumbs = useMemo(() => [
    { name: 'Início', href: '/' },
    { name: 'Cafés', href: '/coffee' },
    { name: coffee?.name || 'Carregando...', href: '#' }
  ], [coffee?.name]);

  const getRoastLevelColor = (roastLevel: string) => {
    switch (roastLevel) {
      case 'light':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-300';
      case 'medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-800/20 dark:text-orange-300';
      case 'dark':
        return 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300';
      case 'espresso':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-300';
    }
  };

  const getRoastLevelText = (roastLevel: string) => {
    switch (roastLevel) {
      case 'light': return 'Clara';
      case 'medium': return 'Média';
      case 'dark': return 'Escura';
      case 'espresso': return 'Espresso';
      default: return roastLevel;
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

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar
          key={i}
          className={`w-4 h-4 ${
            i <= rating 
              ? 'fill-amber-400 text-amber-400' 
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      );
    }
    return stars;
  };

  // Skeleton Loading Component
  const SkeletonLoader = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-amber-950 dark:to-orange-950">
      <Header />
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs Skeleton */}
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-4 w-16 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Skeleton */}
          <div className="space-y-4">
            <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
          </div>

          {/* Details Skeleton */}
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <div className="h-8 w-3/4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-6 w-1/2 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-4">
              <div className="h-10 w-32 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 bg-white dark:bg-amber-950/50 rounded-xl border border-gray-200 dark:border-amber-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-3 w-16 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <div className="h-14 w-full bg-gray-300 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          </div>
        </div>

        {/* Description Skeleton */}
        <div className="mt-12">
          <div className="bg-white dark:bg-amber-950/50 rounded-2xl p-8 border border-gray-200 dark:border-amber-700/50">
            <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (dictLoading || loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-amber-950 dark:to-orange-950">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <FiPackage className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={handleGoBack}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!coffee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-amber-950 dark:to-orange-950">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-amber-200">Café não encontrado</p>
            <button
              onClick={handleGoBack}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg transition-colors mt-4"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Image Zoom Modal
  const ImageZoomModal = () => {
    if (!showImageZoom || !coffee?.medias?.[zoomImageIndex]) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
        <div className="relative max-w-4xl w-full">
          <button
            onClick={() => setShowImageZoom(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <FiX className="w-8 h-8" />
          </button>
          
          <Image
            src={coffee.medias[zoomImageIndex].mediaUrl}
            alt={coffee.name}
            width={1200}
            height={800}
            className="w-full h-auto rounded-lg"
          />
          
          {coffee.medias.length > 1 && (
            <div className="flex justify-center space-x-2 mt-4">
              {coffee.medias.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setZoomImageIndex(index)}
                  className={`w-3 h-3 rounded-full ${
                    index === zoomImageIndex ? 'bg-amber-500' : 'bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-amber-950 dark:to-orange-950">
      <Header />
      
      {/* Image Zoom Modal */}
      <ImageZoomModal />
      
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 mb-6 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index === 0 ? (
                <button
                  onClick={() => router.push(crumb.href)}
                  className="flex items-center text-gray-600 dark:text-amber-200 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  <FiHome className="mr-1" />
                  {crumb.name}
                </button>
              ) : index === breadcrumbs.length - 1 ? (
                <span className="text-gray-900 dark:text-white font-medium">{crumb.name}</span>
              ) : (
                <>
                  <FiChevronRight className="mx-2 text-gray-400" />
                  <button
                    onClick={() => router.push(crumb.href)}
                    className="text-gray-600 dark:text-amber-200 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    {crumb.name}
                  </button>
                </>
              )}
              {index < breadcrumbs.length - 1 && index !== 0 && (
                <FiChevronRight className="mx-2 text-gray-400" />
              )}
            </div>
          ))}
        </nav>

        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="flex items-center text-gray-600 dark:text-amber-200 hover:text-amber-600 dark:hover:text-amber-400 transition-colors mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Voltar
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images Section */}
          <div className="space-y-4">
            <div className="relative group">
              {coffee.medias && coffee.medias.length > 0 ? (
                <>
                  <Carrousel
                    images={coffee.medias.map(media => media.mediaUrl)}
                    autoPlay={false}
                    showIndicators={coffee.medias.length > 1}
                    showArrows={coffee.medias.length > 1}
                    showInfoCard={false}
                    height="h-96"
                    className="rounded-2xl overflow-hidden"
                    supportVideos={true}
                  />
                  
                  {/* Zoom Button */}
                  <button
                    onClick={() => handleImageZoom(selectedImageIndex)}
                    className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                  >
                    <FiZoomIn className="w-5 h-5" />
                  </button>

                  {/* Image Thumbnails */}
                  {coffee.medias.length > 1 && (
                    <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
                      {coffee.medias.map((media, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            selectedImageIndex === index 
                              ? 'border-amber-500 ring-2 ring-amber-200' 
                              : 'border-gray-200 dark:border-gray-700 hover:border-amber-300'
                          }`}
                        >
                          <Image
                            src={media.mediaUrl}
                            alt={`${coffee.name} - ${index + 1}`}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-96 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 rounded-2xl flex items-center justify-center">
                  <FiPackage className="h-24 w-24 text-amber-300" />
                </div>
              )}
            </div>
          </div>

          {/* Coffee Details */}
          <div className="space-y-6">
            {/* Title, Actions and Price */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {coffee.name}
                </h1>
                
                <div className="flex items-center space-x-2">
                  {/* Favorite Button */}
                  <button
                    onClick={handleToggleFavorite}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      isFavorite 
                        ? 'bg-red-100 dark:bg-red-900/20 text-red-500' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <FiHeart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>

                  {/* Share Button */}
                  <div className="relative" ref={shareMenuRef}>
                    <button
                      onClick={() => handleShare()}
                      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-amber-500 transition-colors"
                    >
                      <FiShare2 className="w-5 h-5" />
                    </button>

                    {/* Share Menu */}
                    {showShareMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-20">
                        <div className="py-2">
                          <button
                            onClick={() => handleShare('whatsapp')}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            WhatsApp
                          </button>
                          <button
                            onClick={() => handleShare('twitter')}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            Twitter
                          </button>
                          <button
                            onClick={() => handleShare('facebook')}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            Facebook
                          </button>
                          <button
                            onClick={() => handleShare('copy')}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            Copiar Link
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {!coffee.isAvailable && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300 rounded-full text-sm font-medium">
                      Sem estoque
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-baseline space-x-4 mb-4">
                <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {formatPrice(coffee.price, coffee.currency)}
                </span>
                <span className="text-lg text-gray-500 dark:text-amber-300">
                  {formatWeight(coffee.weight, coffee.weightUnit)}
                </span>
              </div>

              {/* Rating */}
              {coffee.review && (
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {renderStars(Math.round(coffee.review.globalRating))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-amber-200">
                    {coffee.review.globalRating.toFixed(1)} ({coffee.review.reviews?.length || 0} avaliações)
                  </span>
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-white dark:bg-amber-950/50 rounded-xl border border-gray-200 dark:border-amber-700/50">
                <FiMapPin className="text-amber-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-amber-300">Origem</p>
                  <p className="font-medium text-gray-900 dark:text-white">{coffee.origin}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-white dark:bg-amber-950/50 rounded-xl border border-gray-200 dark:border-amber-700/50">
                <FiCoffee className="text-amber-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-amber-300">Torra</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoastLevelColor(coffee.roastLevel)}`}>
                    {getRoastLevelText(coffee.roastLevel)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-white dark:bg-amber-950/50 rounded-xl border border-gray-200 dark:border-amber-700/50">
                <FiPackage className="text-amber-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-amber-300">Estoque</p>
                  <p className="font-medium text-gray-900 dark:text-white">{coffee.stockQuantity} unidades</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-white dark:bg-amber-950/50 rounded-xl border border-gray-200 dark:border-amber-700/50">
                <FiBox className="text-amber-500" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-amber-300">Peso</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatWeight(coffee.weight, coffee.weightUnit)}</p>
                </div>
              </div>
            </div>

            {/* Categories */}
            {coffee.categories && coffee.categories.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Categorias</h3>
                <div className="flex flex-wrap gap-2">
                  {coffee.categories.map((category) => (
                    <div 
                      key={category.id}
                      className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-amber-950/50 rounded-full border border-gray-200 dark:border-amber-700/50"
                    >
                      <span className="material-symbols-outlined text-amber-500 text-sm">
                        {category.icon}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-amber-200">{category.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {coffee.isAvailable && (
              <div className="flex items-center justify-between p-4 bg-white dark:bg-amber-950/50 rounded-xl border border-gray-200 dark:border-amber-700/50">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 dark:text-amber-200 font-medium">Quantidade:</span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    
                    <span className="w-12 text-center font-semibold text-lg text-gray-900 dark:text-white">
                      {quantity}
                    </span>
                    
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= coffee.stockQuantity}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-amber-300">Total</div>
                  <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                    {formatPrice(totalPrice, coffee.currency)}
                  </div>
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!coffee.isAvailable}
              className={`w-full py-4 px-6 rounded-xl font-medium text-lg transition-all duration-200 transform hover:scale-[1.02] ${
                coffee.isAvailable
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {coffee.isAvailable ? (
                <div className="flex items-center justify-center space-x-2">
                  <FiShoppingCart className="h-5 w-5" />
                  <span>
                    Adicionar {quantity > 1 ? `${quantity} unidades` : ''} ao Carrinho
                  </span>
                </div>
              ) : (
                'Indisponível'
              )}
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col items-center text-center p-3 bg-white dark:bg-amber-950/50 rounded-lg border border-gray-200 dark:border-amber-700/50">
                <FiTruck className="w-6 h-6 text-amber-500 mb-2" />
                <span className="text-xs text-gray-600 dark:text-amber-200">Entrega Rápida</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-white dark:bg-amber-950/50 rounded-lg border border-gray-200 dark:border-amber-700/50">
                <FiShield className="w-6 h-6 text-amber-500 mb-2" />
                <span className="text-xs text-gray-600 dark:text-amber-200">Compra Segura</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-white dark:bg-amber-950/50 rounded-lg border border-gray-200 dark:border-amber-700/50">
                <FiAward className="w-6 h-6 text-amber-500 mb-2" />
                <span className="text-xs text-gray-600 dark:text-amber-200">Qualidade Premium</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-12">
          <div className="bg-white dark:bg-amber-950/50 rounded-2xl p-8 border border-gray-200 dark:border-amber-700/50">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sobre este café</h2>
            <p className="text-gray-700 dark:text-amber-200 leading-relaxed text-lg">
              {coffee.description}
            </p>
          </div>
        </div>

        {/* Seller Info */}
        <div className="mt-8">
          <div className="bg-white dark:bg-amber-950/50 rounded-2xl p-8 border border-gray-200 dark:border-amber-700/50">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Vendedor</h2>
            
            <div className="flex items-center space-x-4">
              {coffee.seller.photoUrl ? (
                <Image
                  src={coffee.seller.photoUrl}
                  alt={coffee.seller.name}
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <FiUser className="h-8 w-8 text-white" />
                </div>
              )}
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {coffee.seller.name}
                </h3>
                <p className="text-gray-600 dark:text-amber-200">Produtor de café</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {coffee.review && coffee.review.reviews && coffee.review.reviews.length > 0 && (
          <div className="mt-8">
            <div className="bg-white dark:bg-amber-950/50 rounded-2xl p-8 border border-gray-200 dark:border-amber-700/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Avaliações dos Clientes
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {renderStars(Math.round(coffee.review.globalRating))}
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {coffee.review.globalRating.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {coffee.review.reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="border-b border-gray-200 dark:border-amber-700/50 pb-6 last:border-b-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-amber-200">
                        {review.rating}/5
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-amber-200 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
                
                {coffee.review.reviews.length > 3 && (
                  <div className="text-center pt-4">
                    <button className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium transition-colors">
                      Ver todas as avaliações ({coffee.review.reviews.length})
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Related Coffees Section */}
        {relatedCoffees.length > 0 && (
          <div className="mt-12">
            <div className="bg-white dark:bg-amber-950/50 rounded-2xl p-8 border border-gray-200 dark:border-amber-700/50">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Cafés Relacionados
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedCoffees.map((relatedCoffee) => (
                  <div
                    key={relatedCoffee.id}
                    onClick={() => router.push(`/coffee/${relatedCoffee.id}`)}
                    className="group cursor-pointer bg-gray-50 dark:bg-amber-900/30 rounded-xl p-4 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    <div className="relative mb-4">
                      {relatedCoffee.medias && relatedCoffee.medias.length > 0 ? (
                        relatedCoffee.medias[0].mediaType === 'VIDEO' ? (
                          <video
                            src={relatedCoffee.medias[0].mediaUrl}
                            className="w-full h-32 object-cover rounded-lg"
                            muted
                            loop
                            playsInline
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => e.currentTarget.pause()}
                          />
                        ) : (
                          <Image
                            src={relatedCoffee.medias[0].mediaUrl}
                            alt={relatedCoffee.name}
                            width={200}
                            height={150}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-800 dark:to-orange-800 rounded-lg flex items-center justify-center">
                          <FiCoffee className="h-8 w-8 text-amber-400" />
                        </div>
                      )}
                      
                      {/* Quick Action Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="text-white bg-amber-500 px-3 py-1 rounded-full text-sm font-medium">
                          Ver Detalhes
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                      {relatedCoffee.name}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-amber-600 dark:text-amber-400 font-bold">
                        {formatPrice(relatedCoffee.price, relatedCoffee.currency)}
                      </span>
                      
                      {relatedCoffee.review && (
                        <div className="flex items-center space-x-1">
                          <FiStar className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs text-gray-600 dark:text-amber-200">
                            {relatedCoffee.review.globalRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
