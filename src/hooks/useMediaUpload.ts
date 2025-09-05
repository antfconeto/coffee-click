import { useState, useCallback } from 'react';
import { S3Service} from '@/services/s3Service';

export interface MediaFile {
  id: string;
  file: File;
  preview: string;
  uploadProgress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  s3Key?: string; // Chave do arquivo no S3
  mediaType: 'PHOTO' | 'VIDEO';
  duration?: number; // Duração do vídeo em segundos
  thumbnail?: string; // Thumbnail para vídeos
}

export interface UploadResult {
  id: string;
  mediaType: 'PHOTO' | 'VIDEO';
  mediaUrl: string;
  s3Key?: string;
}

export const useMediaUpload = () => {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Função para detectar se é vídeo
  const isVideoFile = useCallback((file: File): boolean => {
    const videoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/mov', 'video/avi'];
    return videoTypes.includes(file.type) || !!file.name.match(/\.(mp4|webm|ogg|mov|avi)$/i);
  }, []);


  const generateVideoThumbnail = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.onloadedmetadata = () => {
        // Definir dimensões do canvas
        canvas.width = 200;
        canvas.height = 150;
        
        // Capturar frame no meio do vídeo
        video.currentTime = video.duration / 2;
      };
      
      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
          resolve(thumbnail);
        }
      };
      
      video.onerror = () => {
        resolve('');
      };
      
      video.src = URL.createObjectURL(file);
    });
  }, []);

  // Função para obter duração do vídeo
  const getVideoDuration = useCallback((file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        resolve(video.duration);
        URL.revokeObjectURL(video.src);
      };
      video.onerror = () => {
        resolve(0);
        URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(file);
    });
  }, []);

  const addMedia = useCallback(async (files: File[]) => {
    const newMedia: MediaFile[] = [];
    
    for (const file of files) {
      const isVideo = isVideoFile(file);
      const mediaType = isVideo ? 'VIDEO' : 'PHOTO';
      
      let thumbnail = '';
      let duration = 0;
      
      if (isVideo) {
        try {
          thumbnail = await generateVideoThumbnail(file);
          duration = await getVideoDuration(file);
        } catch (error) {
          console.warn('Erro ao gerar thumbnail/duração do vídeo:', error);
        }
      }
      
      const mediaFile: MediaFile = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
        uploadProgress: 0,
        status: 'pending',
        mediaType,
        duration,
        thumbnail
      };
      
      newMedia.push(mediaFile);
    }

    setMedia(prev => {
      const updatedMedia = [...prev, ...newMedia];
      console.log('📹 Media updated:', updatedMedia.length);
      return updatedMedia;
    });
  }, [isVideoFile, generateVideoThumbnail, getVideoDuration]);

  const removeMedia = useCallback((id: string) => {
    setMedia(prev => {
      const mediaFile = prev.find(m => m.id === id);
      if (mediaFile) {
        URL.revokeObjectURL(mediaFile.preview);
        if (mediaFile.thumbnail) {
          URL.revokeObjectURL(mediaFile.thumbnail);
        }

        if (mediaFile.s3Key) {
          S3Service.deleteFile(mediaFile.s3Key).catch(console.error);
        }
      }
      const updatedMedia = prev.filter(m => m.id !== id);
      console.log('🗑️ Media removed, remaining:', updatedMedia.length);
      return updatedMedia;
    });
  }, []);

  const updateMediaStatus = useCallback((id: string, updates: Partial<MediaFile>) => {
    setMedia(prev => prev.map(m => 
      m.id === id ? { ...m, ...updates } : m
    ));
  }, []);

  const uploadToS3 = useCallback(async (mediaFile: MediaFile): Promise<string> => {
    try {

      updateMediaStatus(mediaFile.id, { 
        status: 'uploading',
        uploadProgress: 0
      });

      // Primeiro, gerar URL pré-assinada
      const presignedResult = await S3Service.generatePresignedUrl(
        mediaFile.file.name,
        mediaFile.file.type,
        'coffees'
      );

      if (!presignedResult.success || !presignedResult.presignedUrl) {
        throw new Error(presignedResult.error || 'Falha ao gerar URL pré-assinada');
      }

      // Depois, fazer upload usando a URL pré-assinada
      const result = await S3Service.uploadFileWithPresignedUrl(
        mediaFile.file,
        presignedResult.presignedUrl,
      );

      if (!result.success || !result.url) {
        throw new Error(result.error || 'Falha no upload para S3');
      }

      updateMediaStatus(mediaFile.id, { 
        status: 'completed',
        uploadProgress: 100,
        s3Key: result.key
      });

      return result.url;

    } catch (error) {

      updateMediaStatus(mediaFile.id, { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Falha no upload'
      });
      throw error;
    }
  }, [updateMediaStatus]);

  const uploadAllMedia = useCallback(async (): Promise<UploadResult[]> => {
    setIsUploading(true);
    console.log(`🆙 Starting upload for ${media.length} media files:`, media);
    
    if (media.length === 0) {
      console.warn('⚠️ No media files to upload');
      setIsUploading(false);
      return [];
    }
    
    // Separar mídias que precisam ser uploadadas vs mídias já existentes
    const mediasToUpload = media.filter(m => m.status !== 'completed');
    const completedMedias = media.filter(m => m.status === 'completed');
    
    console.log(`📊 Media analysis: ${mediasToUpload.length} to upload, ${completedMedias.length} already completed`);
    
    try {
      const results: UploadResult[] = [];
      
      // Adicionar mídias já completadas diretamente ao resultado
      completedMedias.forEach(mediaFile => {
        console.log(`✅ Media already completed: ${mediaFile.id}`);
        results.push({
          id: mediaFile.id,
          mediaType: mediaFile.mediaType,
          mediaUrl: mediaFile.s3Key || mediaFile.preview, // Usar s3Key se disponível, senão preview
          s3Key: mediaFile.s3Key
        });
      });
      
      // Upload apenas das mídias pendentes
      if (mediasToUpload.length > 0) {
        const uploadPromises = mediasToUpload.map(async (mediaFile, index) => {
          console.log(`📤 Uploading media ${index + 1}/${mediasToUpload.length}:`, mediaFile.file.name);
          
          try {
            console.log("mediaFile", mediaFile);
            const mediaUrl = await uploadToS3(mediaFile);
            console.log(`✅ Media ${index + 1} uploaded successfully:`, mediaUrl);
            
            return {
              id: mediaFile.id,
              mediaType: mediaFile.mediaType,
              mediaUrl: mediaUrl,
              s3Key: mediaFile.s3Key
            };
          } catch (error) {
            console.error(`❌ Error uploading media ${index + 1}:`, error);
            throw error;
          }
        });

        const uploadedResults = await Promise.all(uploadPromises);
        results.push(...uploadedResults);
      }
      
      console.log('🎉 All uploads completed successfully:', results);
      return results;
      
    } catch (error) {
      console.error('💥 Error in uploadAllMedia:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [media, uploadToS3]);

  const clearMedia = useCallback(() => {
    media.forEach(mediaFile => {
      URL.revokeObjectURL(mediaFile.preview);
      if (mediaFile.thumbnail) {
        URL.revokeObjectURL(mediaFile.thumbnail);
      }

      if (mediaFile.s3Key) {
        S3Service.deleteFile(mediaFile.s3Key).catch(console.error);
      }
    });
    setMedia([]);
    console.log('🧹 All media cleared');
  }, [media]);

  const validateMedia = useCallback(() => {
    const errors: string[] = [];
    
    if (media.length === 0) {
      errors.push('Pelo menos um arquivo de mídia é obrigatório');
    }
    
    media.forEach((mediaFile, index) => {
      const isVideo = mediaFile.mediaType === 'VIDEO';
      const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024; 
      const maxSizeText = isVideo ? '100MB' : '5MB';
      
      if (mediaFile.file.size > maxSize) {
        errors.push(`Arquivo ${index + 1} excede ${maxSizeText}`);
      }
      
      if (isVideo && !mediaFile.file.type.startsWith('video/')) {
        errors.push(`Arquivo ${index + 1} não é um vídeo válido`);
      } else if (!isVideo && !mediaFile.file.type.startsWith('image/')) {
        errors.push(`Arquivo ${index + 1} não é uma imagem válida`);
      }
    });
    
    return errors;
  }, [media]);

  const retryUpload = useCallback(async (mediaId: string): Promise<boolean> => {
    const mediaFile = media.find(m => m.id === mediaId);
    if (!mediaFile) return false;

    try {
      await uploadToS3(mediaFile);
      return true;
    } catch (error) {
      console.error('Erro ao tentar novamente:', error);
      return false;
    }
  }, [media, uploadToS3]);

  const setMediaFromUrls = useCallback((mediaUrls: Array<{id: string, mediaUrl: string, mediaType: 'PHOTO' | 'VIDEO'}>) => {
    console.log('📥 Setting media from existing URLs:', mediaUrls);
    
    const mediaFiles: MediaFile[] = mediaUrls.map((mediaItem) => ({
      id: mediaItem.id,
      file: new File([], `existing-${mediaItem.mediaType.toLowerCase()}-${mediaItem.id}`, {
        type: mediaItem.mediaType === 'PHOTO' ? 'image/jpeg' : 'video/mp4'
      }),
      preview: mediaItem.mediaUrl,
      uploadProgress: 100,
      status: 'completed' as const,
      s3Key: mediaItem.mediaUrl,
      mediaType: mediaItem.mediaType,
      thumbnail: mediaItem.mediaType === 'VIDEO' ? mediaItem.mediaUrl : undefined
    }));
    
    console.log('📄 Created media files:', mediaFiles);
    setMedia(mediaFiles);
  }, []);

  return {
    media,
    isUploading,
    addMedia,
    removeMedia,
    updateMediaStatus,
    uploadToS3,
    uploadAllMedia,
    clearMedia,
    validateMedia,
    retryUpload,
    setMediaFromUrls
  };
};
