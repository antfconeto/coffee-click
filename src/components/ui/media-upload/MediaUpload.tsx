'use client';

import { useRef, useState, useEffect } from 'react';
import {FiX, FiImage, FiVideo, FiRefreshCw, FiAlertCircle, FiPlay } from 'react-icons/fi';
import { MediaFile } from '@/hooks/useMediaUpload';
import { useMediaUploadContext } from '@/contexts/MediaUploadContext';
import { useDictionary } from '@/hooks/useDictionary';
import Image from 'next/image';

interface MediaUploadProps {
  onMediaChange?: (media: MediaFile[]) => void;
  maxMedia?: number;
  acceptedTypes?: string[];
  className?: string;
}

export function MediaUpload({
  onMediaChange,
  maxMedia = 10,
  acceptedTypes = ['image/*', 'video/*'],
  className = ''
}: MediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { dictionary } = useDictionary();
  
  const {
    media,
    addMedia,
    removeMedia,
    retryUpload
  } = useMediaUploadContext();

  // Notificar mudanças na mídia sempre que o estado mudar
  const handleMediaChange = (newMedia: MediaFile[]) => {
    console.log('🔄 Media changed in MediaUpload:', newMedia.length);
    console.log("newMedia",newMedia);
    onMediaChange?.(newMedia);
  };

  const validateFiles = (files: File[]): string[] => {
    const newErrors: string[] = [];
    
    if (media.length + files.length > maxMedia) {
      newErrors.push(dictionary?.common.mediaUpload.validation.maxFiles.replace('{maxMedia}', maxMedia.toString()) || `Máximo de ${maxMedia} arquivos de mídia permitidos`);
    }
    
    files.forEach((file, index) => {
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? 100 : 5; // 100MB para vídeos, 5MB para imagens
      
      if (file.size > maxSize * 1024 * 1024) {
        newErrors.push(dictionary?.common.mediaUpload.validation.fileSize
          .replace('{index}', (index + 1).toString())
          .replace('{maxSize}', maxSize.toString()) || `Arquivo ${index + 1} excede ${maxSize}MB`);
      }
      
      if (!acceptedTypes.some(type => {
        if (type === 'image/*') return file.type.startsWith('image/');
        if (type === 'video/*') return file.type.startsWith('video/');
        return file.type === type;
      })) {
        newErrors.push(dictionary?.common.mediaUpload.validation.invalidType.replace('{index}', (index + 1).toString()) || `Arquivo ${index + 1} não é um tipo válido`);
      }
    });
    
    return newErrors;
  };

  const handleFiles = (files: File[]) => {
    const validationErrors = validateFiles(files);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setTimeout(() => setErrors([]), 5000); // Limpar erros após 5s
      return;
    }
    
    console.log('📁 Adding files to MediaUpload:', files.length);
    addMedia(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveMedia = (id: string) => {
    console.log('🗑️ Removing media from MediaUpload:', id);
    removeMedia(id);
  };

  const handleRetryUpload = async (id: string) => {
    try {
      await retryUpload(id);
    } catch (error) {
      console.error('Error retrying upload:', error);
    }
  };

  // Notificar mudanças sempre que media mudar
  useEffect(() => {
    handleMediaChange(media);
  }, [media]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!dictionary) {
    return null; // Não renderizar até que o dicionário esteja carregado
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de Drop */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 scale-105'
            : 'border-gray-300 dark:border-amber-700/50 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-gray-50 dark:hover:bg-amber-950/10'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex justify-center space-x-4 mb-4">
          <FiImage className={`h-12 w-12 transition-colors ${
            dragActive 
              ? 'text-amber-600' 
              : 'text-gray-400 dark:text-amber-600'
          }`} />
          <FiVideo className={`h-12 w-12 transition-colors ${
            dragActive 
              ? 'text-amber-600' 
              : 'text-gray-400 dark:text-amber-600'
          }`} />
        </div>
        
        <div className="mt-4">
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {dictionary.common.mediaUpload.dropZone.title}
          </p>
          <p className="text-gray-500 dark:text-amber-400 mt-1">
            {dictionary.common.mediaUpload.dropZone.subtitle}
          </p>
          <p className="text-xs text-gray-400 dark:text-amber-500/70 mt-2">
            {dictionary.common.mediaUpload.dropZone.info.replace('{maxMedia}', maxMedia.toString())}
          </p>
        </div>
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
        >
          {dictionary.common.mediaUpload.dropZone.button}
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Mensagens de Erro */}
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiX className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                {dictionary.common.mediaUpload.validation.title}
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <ul className="list-disc pl-5 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview da Mídia */}
      {media.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <div className="flex items-center space-x-2 mr-2">
              <FiImage className="text-amber-600" />
              <FiVideo className="text-amber-600" />
            </div>
            {dictionary.common.mediaUpload.preview.title
              .replace('{count}', media.length.toString())
              .replace('{maxMedia}', maxMedia.toString())}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {media.map((mediaFile) => (
              <div key={mediaFile.id} className="relative group">
                {/* Preview da mídia */}
                {mediaFile.mediaType === 'VIDEO' ? (
                  <div className="w-full h-24 bg-gray-900 rounded-lg border border-gray-200 dark:border-amber-700/50 relative overflow-hidden">
                    {mediaFile.thumbnail ? (
                      <Image
                        src={mediaFile.thumbnail}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                        width={100}
                        height={100}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <FiVideo className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Ícone de play sobreposto */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
                        <FiPlay className="w-4 h-4 text-white ml-0.5" />
                      </div>
                    </div>
                    
                    {/* Duração do vídeo */}
                    {mediaFile.duration && (
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                        {formatDuration(mediaFile.duration)}
                      </div>
                    )}
                  </div>
                ) : (
                  <Image
                    src={mediaFile.preview}
                    alt="Preview"
                    className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-amber-700/50"
                    width={100}
                    height={100}
                  />
                )}
                
                {/* Indicador de tipo de mídia */}
                <div className="absolute top-1 left-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center">
                  {mediaFile.mediaType === 'VIDEO' ? (
                    <FiVideo className="w-3 h-3 text-white" />
                  ) : (
                    <FiImage className="w-3 h-3 text-white" />
                  )}
                </div>
                
                {/* Overlay com progresso */}
                {mediaFile.status === 'uploading' && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
                      <span className="text-xs">{Math.round(mediaFile.uploadProgress)}%</span>
                    </div>
                  </div>
                )}

                {/* Status de erro */}
                {mediaFile.status === 'error' && (
                  <div className="absolute inset-0 bg-red-500/80 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <FiAlertCircle className="w-6 h-6 mx-auto mb-1" />
                      <span className="text-xs">{dictionary.common.mediaUpload.preview.error}</span>
                    </div>
                  </div>
                )}

                {/* Status de sucesso */}
                {mediaFile.status === 'completed' && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                  </div>
                )}

                {/* Botão remover */}
                <button
                  type="button"
                  onClick={() => handleRemoveMedia(mediaFile.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <FiX className="w-3 h-3" />
                </button>

                {/* Botão retry para mídia com erro */}
                {mediaFile.status === 'error' && (
                  <button
                    type="button"
                    onClick={() => handleRetryUpload(mediaFile.id)}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    title={dictionary.common.mediaUpload.preview.retry}
                  >
                    <FiRefreshCw className="w-4 h-4" />
                  </button>
                )}

                {/* Nome do arquivo */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg truncate">
                  {mediaFile.file.name}
                </div>

                {/* Mensagem de erro específica */}
                {mediaFile.status === 'error' && mediaFile.error && (
                  <div className="absolute -bottom-8 left-0 right-0 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 text-xs p-1 rounded border border-red-200 dark:border-red-800 truncate">
                    {mediaFile.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
