'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useMediaUpload, MediaFile, UploadResult } from '@/hooks/useMediaUpload';

interface MediaUploadContextType {
  media: MediaFile[];
  isUploading: boolean;
  addMedia: (files: File[]) => void;
  removeMedia: (id: string) => void;
  updateMediaStatus: (id: string, updates: Partial<MediaFile>) => void;
  uploadToS3: (media: MediaFile) => Promise<string>;
  uploadAllMedia: () => Promise<UploadResult[]>;
  clearMedia: () => void;
  validateMedia: () => string[];
  retryUpload: (mediaId: string) => Promise<boolean>;
  setMediaFromUrls: (mediaUrls: Array<{id: string, mediaUrl: string, mediaType: 'PHOTO' | 'VIDEO'}>) => void;
}

const MediaUploadContext = createContext<MediaUploadContextType | undefined>(undefined);

interface MediaUploadProviderProps {
  children: ReactNode;
}

export function MediaUploadProvider({ children }: MediaUploadProviderProps) {
  const mediaUploadHook = useMediaUpload();

  return (
    <MediaUploadContext.Provider value={mediaUploadHook}>
      {children}
    </MediaUploadContext.Provider>
  );
}

export function useMediaUploadContext() {
  const context = useContext(MediaUploadContext);
  if (context === undefined) {
    throw new Error('useMediaUploadContext must be used within a MediaUploadProvider');
  }
  return context;
}
