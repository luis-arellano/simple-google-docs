'use client';

import { create } from 'zustand';
import { GistState } from './types';
import { fetchUserGists, fetchGistDetail, GitHubApiError } from '../services/githubApi';

export const useGistStore = create<GistState>((set, get) => ({
  // Search state
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  searchError: null,
  
  // Detail state
  currentGist: null,
  isLoadingGist: false,
  gistError: null,
  
  // Actions
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  searchGists: async (username: string) => {
    set({ isSearching: true, searchError: null });
    
    try {
      const gists = await fetchUserGists(username);
      set({ 
        searchResults: gists,
        isSearching: false,
        searchError: null
      });
    } catch (error) {
      const errorMessage = error instanceof GitHubApiError 
        ? error.message 
        : 'An unexpected error occurred while searching for gists';
      
      set({ 
        searchResults: [],
        isSearching: false,
        searchError: errorMessage
      });
    }
  },

  loadGistDetail: async (gistId: string) => {
    set({ isLoadingGist: true, gistError: null });
    
    try {
      const gist = await fetchGistDetail(gistId);
      set({ 
        currentGist: gist,
        isLoadingGist: false,
        gistError: null
      });
    } catch (error) {
      const errorMessage = error instanceof GitHubApiError 
        ? error.message 
        : 'An unexpected error occurred while loading the gist';
      
      set({ 
        currentGist: null,
        isLoadingGist: false,
        gistError: errorMessage
      });
    }
  },

  clearSearch: () => {
    set({ 
      searchQuery: '',
      searchResults: [],
      searchError: null,
      isSearching: false
    });
  },

  clearCurrentGist: () => {
    set({ 
      currentGist: null,
      gistError: null,
      isLoadingGist: false
    });
  }
}));
