'use client';

import { useEffect } from 'react';
import { useGistStore } from '../store/gistStore';

export const useGistDetail = (gistId: string) => {
  const { 
    currentGist, 
    isLoadingGist, 
    gistError, 
    loadGistDetail, 
    clearCurrentGist 
  } = useGistStore();
  
  useEffect(() => {
    if (gistId) {
      loadGistDetail(gistId);
    }
    return () => clearCurrentGist();
  }, [gistId, loadGistDetail, clearCurrentGist]);
  
  return {
    gist: currentGist,
    isLoading: isLoadingGist,
    error: gistError
  };
};
