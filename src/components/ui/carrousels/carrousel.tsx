'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from "next/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface SlideInfo {
  title?: string;
  description?: string;
  tags?: string[];
  author?: string;
  date?: string;
  location?: string;
  rating?: number;
  customFields?: Record<string, string>;
}

interface CarrouselProps {
  images: string[];
  slidesInfo?: (SlideInfo | null)[];
  autoPlay?: boolean;
  interval?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
  showInfoCard?: boolean;
  infoCardOpacity?: number;
  className?: string;
  height?: string;
  width?: string;
  supportVideos?: boolean;
}

export function Carrousel({
  images,
  slidesInfo = [],
  autoPlay = true,
  interval = 5000,
  showIndicators = true,
  showArrows = true,
  showInfoCard = true,
  infoCardOpacity = 0.85,
  className = "",
  height = "h-64 md:h-96",
  width = "w-full",
  supportVideos = false
}: CarrouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  // Função para detectar se é vídeo ou imagem
  const isVideo = useCallback((url: string) => {
    if (!supportVideos) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext)) || 
           url.includes('blob:') || // Para vídeos gravados
           url.includes('data:video'); // Para vídeos em base64
  }, [supportVideos]);



  // Navegação para o próximo slide
  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  // Navegação para o slide anterior
  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]);

  // Navegação direta para um slide específico
  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Pausar/retomar autoplay
  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Efeito para autoplay
  useEffect(() => {
    if (!isPlaying || !autoPlay) return;

    const timer = setInterval(() => {
      nextSlide();
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, autoPlay, interval, nextSlide]);

  // Pausar autoplay quando o mouse está sobre o carrossel
  const handleMouseEnter = useCallback(() => {
    if (autoPlay) setIsPlaying(false);
  }, [autoPlay]);

  const handleMouseLeave = useCallback(() => {
    if (autoPlay) setIsPlaying(true);
  }, [autoPlay]);

  // Verificar se há imagens
  if (!images || images.length === 0) {
    return (
      <div className={`relative w-full h-64 md:h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-amber-700/50 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-300 dark:bg-amber-700/30 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-amber-400 font-medium">Nenhuma imagem disponível</p>
          <p className="text-gray-400 dark:text-amber-500/70 text-sm">Adicione imagens para visualizar o carrossel</p>
        </div>
      </div>
    );
  }

  // Componente do card de informações para cada slide
  const SlideInfoCard = ({ info, isVisible }: { info: SlideInfo | null; isVisible: boolean }) => {
    if (!info || !showInfoCard) return null;

    return (
      <div 
        className={`absolute bottom-0 left-0 pb-10 right-0 transition-all duration-500 ease-in-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Gradiente de fundo com blur */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent backdrop-blur-sm"
          style={{ 
            background: `linear-gradient(to top, rgba(0,0,0,${infoCardOpacity}), rgba(0,0,0,${infoCardOpacity * 0.6}), transparent)`
          }}
        />
        
        {/* Conteúdo do card */}
        <div className="relative p-3 z-10">
          {/* Header com título e rating */}
          <div className="flex items-start justify-between mb-2">
            {info.title && (
              <h3 className="text-lg font-bold text-white leading-tight flex-1 mr-3">
                {info.title}
              </h3>
            )}
            
            {info.rating && (
              <div className="flex items-center bg-amber-500/20 px-2 py-1 rounded-full">
                <div className="flex items-center mr-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.floor(info.rating!) 
                          ? 'text-amber-400 fill-current' 
                          : 'text-white/30'
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-white font-medium">({info.rating})</span>
              </div>
            )}
          </div>

          {/* Descrição compacta */}
          {info.description && (
            <p className="text-white/90 text-xs mb-2 leading-relaxed line-clamp-2">
              {info.description}
            </p>
          )}

          {/* Tags em linha compacta */}
          {info.tags && info.tags.length > 0 && (
            <div className="mb-2">
              <div className="flex flex-wrap gap-1">
                {info.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-xs bg-amber-500/80 text-white rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
                {info.tags.length > 3 && (
                  <span className="px-2 py-0.5 text-xs bg-white/20 text-white/80 rounded-full">
                    +{info.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Informações principais em grid compacto */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-white/80">
            {info.author && (
              <div className="flex items-center">
                <span className="font-medium mr-1 text-white/90">Por:</span>
                <span className="truncate">{info.author}</span>
              </div>
            )}
            
            {info.location && (
              <div className="flex items-center">
                <span className="font-medium mr-1 text-white/90">Local:</span>
                <span className="truncate">{info.location}</span>
              </div>
            )}
            
            {info.date && (
              <div className="flex items-center">
                <span className="font-medium mr-1 text-white/90">Data:</span>
                <span>{info.date}</span>
              </div>
            )}
          </div>

          {/* Campos customizados em grid compacto */}
          {info.customFields && Object.keys(info.customFields).length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/20">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {Object.entries(info.customFields).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="flex items-center text-white/80">
                    <span className="font-medium mr-1 text-white/90 capitalize">{key}:</span>
                    <span className="truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Renderizar apenas o slide atual para melhor performance
  const renderCurrentSlide = () => {
    const mediaUrl = images[currentIndex];
    const slideInfo = slidesInfo[currentIndex] || null;
    const isVideoFile = isVideo(mediaUrl);
    
    return (
      <div className="absolute inset-0">
        {isVideoFile ? (
          <video
            src={mediaUrl}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            onLoadedMetadata={(e) => {
              const video = e.target as HTMLVideoElement;
              video.play().catch(() => {
                // Ignora erros de autoplay
              });
            }}
          />
        ) : (
          <Image
            src={mediaUrl}
            alt={`Slide ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        )}
        
        {/* Card de informações sobreposto na mídia */}
        <SlideInfoCard 
          info={slideInfo} 
          isVisible={true} 
        />
      </div>
    );
  };

  return (
    <div 
      className={`relative ${width} group `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Container principal do carrossel */}
      <div className={`relative ${height} rounded-2xl overflow-hidden scroll-smooth bg-gray-100 dark:bg-amber-950/20`}>
        {/* Renderizar apenas o slide atual */}
        {renderCurrentSlide()}

        {/* Contador de slides */}
        <div className="absolute top-4 right-4  bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Indicador de tipo de mídia */}
        {supportVideos && isVideo(images[currentIndex]) && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2  bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Vídeo</span>
          </div>
        )}

        {/* Botão de play/pause */}
        {autoPlay && (
          <button
            onClick={togglePlayPause}
            className="absolute top-4 left-4  bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-all duration-300 group/play"
            aria-label={isPlaying ? 'Pausar slideshow' : 'Retomar slideshow'}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        )}

        {/* Botão de play/pause para vídeos */}
        {supportVideos && isVideo(images[currentIndex]) && (
          <button
            onClick={() => {
              const videoElement = document.querySelector(`video[src="${images[currentIndex]}"]`) as HTMLVideoElement;
              if (videoElement) {
                if (videoElement.paused) {
                  videoElement.play().catch(() => {
                    // Ignora erros de autoplay
                  });
                } else {
                  videoElement.pause();
                }
              }
            }}
            className="absolute top-16 left-4 z-10 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-all duration-300"
            aria-label="Play/Pause vídeo"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}

        {/* Botões de navegação */}
        {showArrows && images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/70 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
              aria-label="Slide anterior"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/70 transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
              aria-label="Próximo slide"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Indicadores */}
      {showIndicators && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={`carousel-indicator-${index}`}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-125 shadow-lg'
                  : 'bg-white/50 hover:bg-white/75 hover:scale-110'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
              aria-current={index === currentIndex}
            />
          ))}
        </div>
      )}

      {/* Barra de progresso do autoplay */}
      {autoPlay && isPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{ 
              width: `${((currentIndex + 1) / images.length) * 100}%` 
            }}
          />
        </div>
      )}
    </div>
  );
}