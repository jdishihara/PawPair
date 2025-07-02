import React, { createContext, useContext, useState } from 'react';

interface SearchContextType {
  showSearch: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [showSearch, setShowSearch] = useState(false);

  const openSearch = () => setShowSearch(true);
  const closeSearch = () => setShowSearch(false);

  return (
    <SearchContext.Provider value={{ showSearch, openSearch, closeSearch }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}