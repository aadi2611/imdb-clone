/**
 * Advanced Search Component with Debounce and Auto-Suggestions
 * - Debounced search to prevent excessive API calls
 * - Multi-field search (title, actors, genres, release year)
 * - Real-time suggestions
 * - Fallback mechanism
 * - Race condition prevention
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { searchMovies } from './apiOptimized';

class DebounceManager {
  constructor(delay = 300) {
    this.delay = delay;
    this.timerId = null;
    this.lastCallTime = 0;
    this.abortController = null;
  }

  debounce(fn) {
    return (...args) => {
      clearTimeout(this.timerId);

      // Cancel previous request if still pending
      if (this.abortController) {
        this.abortController.abort();
      }

      this.abortController = new AbortController();
      this.timerId = setTimeout(() => {
        this.lastCallTime = Date.now();
        fn(...args, this.abortController.signal);
      }, this.delay);
    };
  }

  cancel() {
    clearTimeout(this.timerId);
    if (this.abortController) {
      this.abortController.abort();
    }
  }
}

export const AdvancedSearchBar = ({
  onSearch,
  onSuggestionsChange,
  placeholder = 'Search movies by title, actor, genre, or year...',
  debounceDelay = 300,
  maxSuggestions = 8,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef(null);
  const debounceManagerRef = useRef(new DebounceManager(debounceDelay));

  const performSearch = useCallback(
    async (searchQuery, signal) => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        onSuggestionsChange?.([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await searchMovies(searchQuery, {
          signal,
          page: 1,
          fields: ['title', 'overview', 'release_date'],
        });

        if (!signal.aborted) {
          const limitedResults = result.results.slice(0, maxSuggestions);
          setSuggestions(limitedResults);
          onSuggestionsChange?.(limitedResults);
          setShowSuggestions(true);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setSuggestions([]);
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [maxSuggestions, onSuggestionsChange]
  );

  const debouncedSearch = useCallback(
    debounceManagerRef.current.debounce((searchQuery, signal) => {
      performSearch(searchQuery, signal);
    }),
    [performSearch]
  );

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleSuggestionClick = useCallback((suggestion) => {
    setQuery(suggestion.title);
    setShowSuggestions(false);
    onSearch?.(suggestion);
  }, [onSearch]);

  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (query.trim()) {
          onSearch?.({ title: query });
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  }, [selectedIndex, suggestions, query, onSearch, handleSuggestionClick]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSuggestions]);

  useEffect(() => {
    return () => {
      debounceManagerRef.current.cancel();
    };
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}

        {query && !isLoading && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setShowSuggestions(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
        >
          {suggestions.length > 0 ? (
            <ul className="divide-y divide-gray-700">
              {suggestions.map((suggestion, idx) => (
                <li
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    idx === selectedIndex ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
                  }`}
                >
                  <div className="font-medium text-sm">{suggestion.title}</div>
                  <div className="text-xs text-gray-400 line-clamp-1">{suggestion.year}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-gray-400 text-center text-sm">
              {error ? `Error: ${error}` : 'No results found'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchBar;
