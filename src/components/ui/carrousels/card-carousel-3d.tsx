'use client';

import { useState, useEffect } from 'react';
import { Coffee } from '@/types/coffee';
import { CoffeeCard } from '@/components/coffee/CoffeeCard';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface CardCarousel3DProps {
  coffees: Coffee[];
  autoPlay?: boolean;
  interval?: number;
  lang?: string;
}

export function CardCarousel3D({ 
  coffees, 
  autoPlay = true, 
  interval = 4000,
  lang = 'pt-br'
}: CardCarousel3DProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || !autoPlay || coffees.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % coffees.length);
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, autoPlay, interval, coffees.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % coffees.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + coffees.length) % coffees.length);
  };

  const getCardPosition = (index: number) => {
    const diff = index - currentIndex;
    const totalCards = coffees.length;
    
    // Normalize position to handle wrap-around
    let position = diff;
    if (diff > totalCards / 2) {
      position = diff - totalCards;
    } else if (diff < -totalCards / 2) {
      position = diff + totalCards;
    }

    return position;
  };

  const getCardStyle = (index: number) => {
    const position = getCardPosition(index);
    
    if (position === 0) {
      // Center card
      return {
        transform: 'translateX(0%) scale(1) rotateY(0deg)',
        zIndex: 10,
        opacity: 1,
      };
    } else if (position === 1) {
      // Right card
      return {
        transform: 'translateX(60%) scale(0.8) rotateY(-15deg)',
        zIndex: 5,
        opacity: 0.7,
      };
    } else if (position === -1) {
      // Left card
      return {
        transform: 'translateX(-60%) scale(0.8) rotateY(15deg)',
        zIndex: 5,
        opacity: 0.7,
      };
    } else if (position === 2) {
      // Far right card
      return {
        transform: 'translateX(120%) scale(0.6) rotateY(-30deg)',
        zIndex: 1,
        opacity: 0.4,
      };
    } else if (position === -2) {
      // Far left card
      return {
        transform: 'translateX(-120%) scale(0.6) rotateY(30deg)',
        zIndex: 1,
        opacity: 0.4,
      };
    } else {
      // Hidden cards
      return {
        transform: 'translateX(150%) scale(0.4)',
        zIndex: 0,
        opacity: 0,
      };
    }
  };

  if (!coffees || coffees.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500 dark:text-gray-400">
        <p>Nenhum café disponível</p>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-125 flex items-center justify-center"
      style={{ perspective: '1000px' }}
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(autoPlay)}
    >
      {/* Cards Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {coffees.map((coffee, index) => {
          const style = getCardStyle(index);
          const position = getCardPosition(index);
          
          // Only render visible cards for performance
          if (Math.abs(position) > 2) return null;

          return (
            <div
              key={coffee.id}
              className="absolute w-80 h-full transition-all duration-700 ease-in-out cursor-pointer hover:scale-105"
              style={style}
              onClick={() => setCurrentIndex(index)}
            >
              <div className="w-full h-full transform-gpu">
                <CoffeeCard
                  coffee={coffee}
                  lang={lang}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 z-20"
        aria-label="Slide anterior"
      >
        <FiChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 z-20"
        aria-label="Próximo slide"
      >
        <FiChevronRight className="w-6 h-6" />
      </button>


    </div>
  );
}
