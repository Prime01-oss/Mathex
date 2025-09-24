import React from 'react';
import { useGeneralContext } from '@components/GeneralContext';
import '../Header/Header.scss'

const Search = () => {
  const { searchQuery, setSearchQuery } = useGeneralContext();

  return (
    <div className="search-bar">
      {/* Search Icon */}
      <i className="fi fi-rr-search" />
      <input
        type="text"
        placeholder="Search by name or tag..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default Search;