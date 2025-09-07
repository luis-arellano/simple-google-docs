'use client';

import { useEffect } from 'react';
import { useGistStore } from '../store/gistStore';
import { useDebounce } from '@/hooks';

export const useGistSearch = () => {
  const { 
    searchQuery, 
    searchResults, 
    isSearching, 
    searchError, 
    setSearchQuery, 
    searchGists 
  } = useGistStore();
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  useEffect(() => {
    if (debouncedSearch.trim()) {
      searchGists(debouncedSearch);
    }
  }, [debouncedSearch, searchGists]);
  
  return {
    searchQuery,
    searchResults,
    isSearching,
    searchError,
    setSearchQuery,
    handleSearch: (username: string) => searchGists(username)
  };
};
