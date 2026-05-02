import React from "react";
import { Search, X } from "lucide-react";

/**
 * SearchBar component for searching products.
 * @param {Object} props
 * @param {string} props.searchQuery - Current search query.
 * @param {boolean} props.searchLoading - Loading state for search.
 * @param {Function} props.handleSearchChange - Handler for search input change.
 * @param {Function} props.handleSearchClear - Handler for clearing search.
 * @param {React.RefObject} props.searchInputRef - Ref for search input.
 * @returns {JSX.Element}
 */
const SearchBar = ({
  searchQuery,
  searchLoading,
  handleSearchChange,
  handleSearchClear,
  searchInputRef,
}) => (
  <div className="relative mb-6">
    <div className="relative max-w-md mx-auto">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        ref={searchInputRef}
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search products..."
        className="block w-full pl-10 pr-10 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        autoComplete="off"
        aria-label="Search products"
      />
      {searchQuery && (
        <button
          onClick={handleSearchClear}
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          aria-label="Clear search"
        >
          <X className="h-5 w-5 text-gray-400 hover:text-gray-200" />
        </button>
      )}
    </div>
    {searchLoading && (
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 mr-3">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )}
    {searchQuery && (
      <div className="mt-2 text-sm text-gray-400 text-center">
        {searchLoading
          ? "Searching..."
          : `Showing results for "${searchQuery}"`}
      </div>
    )}
  </div>
);

export default React.memo(SearchBar);
