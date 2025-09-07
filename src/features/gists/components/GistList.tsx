'use client';

import { useState } from 'react';
import { SearchInput, LoadingSpinner, ErrorMessage } from '@/components/ui';
import { useGistSearch } from '../hooks';
import { GistCard } from './GistCard';

export const GistList = () => {
  const [inputValue, setInputValue] = useState('');
  const { searchResults, isSearching, searchError, handleSearch } = useGistSearch();

  const onSearchSubmit = () => {
    if (inputValue.trim()) {
      handleSearch(inputValue.trim());
    }
  };

  const onRetry = () => {
    if (inputValue.trim()) {
      handleSearch(inputValue.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔍 GitHub Gists Search
        </h1>
        <p className="text-gray-600">
          Search for public gists by GitHub username
        </p>
      </div>

      {/* Search Section */}
      <div className="mb-8">
        <div className="flex gap-3">
          <div className="flex-1">
            <SearchInput
              placeholder="Enter GitHub username..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onSearch={onSearchSubmit}
              isLoading={isSearching}
            />
          </div>
          <button
            onClick={onSearchSubmit}
            disabled={isSearching || !inputValue.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSearching ? (
              <LoadingSpinner size="small" />
            ) : (
              'Search'
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div>
        {/* Error State */}
        {searchError && (
          <ErrorMessage
            message={searchError}
            onRetry={onRetry}
            className="mb-6"
          />
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="text-center py-12">
            <LoadingSpinner size="large" />
            <p className="text-gray-600 mt-4">Searching for gists...</p>
          </div>
        )}

        {/* Results */}
        {!isSearching && !searchError && searchResults.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Results ({searchResults.length} gists found)
            </h2>
            <div className="space-y-4">
              {searchResults.map((gist) => (
                <GistCard key={gist.id} gist={gist} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isSearching && !searchError && searchResults.length === 0 && inputValue && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No gists found
            </h3>
            <p className="text-gray-600">
              Try searching for a different username or check if the user has public gists.
            </p>
          </div>
        )}

        {/* Initial State */}
        {!isSearching && !searchError && searchResults.length === 0 && !inputValue && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Search GitHub Gists
            </h3>
            <p className="text-gray-600">
              Enter a GitHub username above to find their public gists.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
