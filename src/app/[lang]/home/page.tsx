'use client';

import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCoffees } from '@/hooks/useCoffees';
import { Header } from '@/components/layout/header/Header';
import { CoffeeCard } from '@/components/coffee/CoffeeCard';
import { Coffee, Loader2, AlertCircle, RefreshCw } from '@/components/icons';
import LoaderCookie from '@/components/ui/loaders/coffee-loader';
import { Carrousel } from '@/components/ui/carrousels/carrousel';
import { useDictionary } from '@/hooks/useDictionary';
import { useEffect, useState } from 'react';
import { Coffee as CoffeeType } from '@/types/coffee';
import { coffeeApi } from '@/api/coffee';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthContext();
  const {
    coffees,
    loading,
    error,
    addToCart,
    refetch
  } = useCoffees();

  const [premiumCoffees, setPremiumCoffees] = useState<{coffees:CoffeeType[], isLoading:boolean}>({coffees:[], isLoading:true});
  
  const { dictionary } = useDictionary();

  useEffect(() => {
    fetchPremiumCoffees();
  }, []);

  const fetchPremiumCoffees = async () => {
    const response = await coffeeApi.listCoffeeByRating(10, 4.0, '');
    setPremiumCoffees({coffees:response.items ?? [], isLoading:false});
  }
  useEffect(() => {
    setMounted(true);
  }, []);



  if (!mounted && loading && !user) {
    return(
      <div className="flex justify-center items-center h-screen flex-col gap-4">
        <Loader2 className="h-12 w-12 text-amber-500 animate-spin"/>
        <p className="text-amber-500">{dictionary?.common?.loading}</p>
      </div>
    )
  }else{
    return (
      <div className="min-h-screen max-w-screen  z-0 bg-gray-50 dark:bg-amber-950/20">
        <Header />
        <div className="w-full h-full pl-30 pr-30 pt-20 flex flex-col items-center z-1 max-md:pl-3 max-md:pr-3 " >
          {/* Seção de Cafés Premium */}
          <section className="w-full max-w-7xl mx-auto mb-20 ">
            {/* Header da seção */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {dictionary?.pages?.home?.sections.premiumCoffees.title}
              </h1>
              <p className="text-xl text-gray-600 dark:text-amber-200 max-w-3xl mx-auto leading-relaxed">
                {dictionary?.pages?.home?.sections.premiumCoffees.description}
              </p>
            </div>
  
            {/* Carrossel de cafés premium */}
            <div className="mb-16 flex items-center justify-center  mr-auto ml-auto">
              <Carrousel
                images={premiumCoffees.coffees.map((coffee) => coffee.medias[0].mediaUrl)}
                height="h-120"
                width="w-210"
                showInfoCard={true}
                infoCardOpacity={0.001}
                supportVideos={true}
                slidesInfo={premiumCoffees.coffees.map((coffee) => ({
                  title: coffee.name,
                  description: coffee.description,
                  rating: coffee.review.globalRating,
                  reviews: coffee.review.reviews.length,
                  price: coffee.price,
                  author: coffee.seller.name,
                  location: coffee.origin,
                  tags: coffee.categories.map((category) => category.name),
                  date: coffee.createdAt,
                  currency: coffee.currency,
                  weight: coffee.weight,
                  weightUnit: coffee.weightUnit,
                }))}
              />
            </div>
  
            {/* Informações sobre os cafés premium */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-6 max-md:p-4 dark:bg-amber-950  shadow-md bg-amber-50  dark:from-amber-900/20 dark:to-amber-800/20  border-none dark:border-amber-700/50">
                <div className="w-16 h-16 mx-auto mb-4 max-md:w-12 max-md:h-12 bg-amber-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 max-md:w-6 max-md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold max-md:text-lg text-amber-800 dark:text-amber-200 mb-2">
                  {dictionary?.pages?.home?.sections?.CardsPremiumCoffees?.card1?.title}
                </h3>
                <p className="text-amber-700 dark:text-amber-300">
                  {dictionary?.pages?.home?.sections?.CardsPremiumCoffees?.card1?.description}
                </p>
              </div>
  
              <div className="text-center p-6 max-md:p-4 dark:bg-amber-950  bg-amber-50   shadow-md  dark:from-amber-900/20 dark:to-amber-800/20  border-none dark:border-amber-700/50">
                <div className="w-16 h-16 mx-auto mb-4 bg-amber-500 max-md:w-12 max-md:h-12 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white max-md:w-6 max-md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold max-md:text-lg text-amber-800 dark:text-amber-200 mb-2">
                  {dictionary?.pages?.home?.sections?.CardsPremiumCoffees?.card2?.title}
                </h3>
                <p className="text-amber-700 dark:text-amber-300">
                  {dictionary?.pages?.home?.sections?.CardsPremiumCoffees?.card2?.description}
                </p>
              </div>
  
              <div className="text-center p-6 max-md:p-4 dark:bg-amber-950  bg-amber-50 shadow-md dark:from-amber-900/20 dark:to-amber-800/20 border-none dark:border-amber-700/50">
                <div className="w-16 h-16 mx-auto mb-4 bg-amber-500 max-md:w-12 max-md:h-12 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white max-md:w-6 max-md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold max-md:text-lg text-amber-800 dark:text-amber-200 mb-2">
                  {dictionary?.pages?.home?.sections?.CardsPremiumCoffees?.card3?.title}
                </h3>
                <p className="text-amber-700 dark:text-amber-300">
                  {dictionary?.pages?.home?.sections?.CardsPremiumCoffees?.card3?.description}
                </p>
              </div>
            </div>
  
            {/* CTA para explorar mais cafés */}
            <div className="text-center">
              <button className="px-8 py-4 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                {dictionary?.pages?.home?.sections?.cta?.button}
              </button>
              <p className="text-gray-600 dark:text-amber-300 mt-4">
                {dictionary?.pages?.home?.sections?.cta?.description}
              </p>
            </div>
          </section>
  
          {/* Seção de Cafés Disponíveis */}
          <section className="w-full max-w-7xl mx-auto mb-20">
            {/* Header da seção */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {dictionary?.pages?.home?.sections?.availableCoffees?.title}
              </h2>
              <p className="text-lg text-gray-600 dark:text-amber-200 max-w-2xl mx-auto leading-relaxed">
                {dictionary?.pages?.home?.sections?.availableCoffees?.description}
              </p>
            </div>
  
            {/* Lista de cafés em linha */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoaderCookie />
              </div>
            ) : error ? (
              <div className="text-center p-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button
                  onClick={refetch}
                  className="flex items-center space-x-2 mx-auto px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>{dictionary?.pages?.home?.sections?.tryAgain?.button}</span>
                </button>
              </div>
            ) : coffees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {coffees.slice(0, 4).map((coffee) => (
                  <CoffeeCard
                    key={coffee.id}
                    coffee={coffee}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-8">
                <Coffee className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {dictionary?.pages?.home?.sections?.availableCoffees?.noCoffees}
                </p>
              </div>
            )}
  
            {/* Botão para ver mais cafés */}
            {coffees.length > 4 && (
              <div className="text-center mt-8">
                <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors">
                  {dictionary?.pages?.home?.sections?.availableCoffees?.viewAll} ({coffees.length})
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }


}
