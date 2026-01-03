import React, { useCallback, useState } from "react";
import { useTheme } from "./ThemeContext";

export function FilterSort({ onFilter, onSort, totalMovies }) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    genre: "",
    ratingMin: 0,
    ratingMax: 10,
    yearMin: 1900,
    yearMax: new Date().getFullYear(),
  });
  const [sortBy, setSortBy] = useState("popularity");

  const { cardBg, cardBorder, text, buttonBg } = useTheme();

  const genres = [
    "Action",
    "Comedy",
    "Drama",
    "Horror",
    "Sci-Fi",
    "Thriller",
    "Adventure",
    "Animation",
    "Romance",
    "Crime",
  ];

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };
      onFilter(updated);
      return updated;
    });
  }, [onFilter]);

  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    onSort(newSort);
  }, [onSort]);

  const handleReset = useCallback(() => {
    const defaultFilters = {
      genre: "",
      ratingMin: 0,
      ratingMax: 10,
      yearMin: 1900,
      yearMax: new Date().getFullYear(),
    };
    setFilters(defaultFilters);
    setSortBy("popularity");
    onFilter(defaultFilters);
    onSort("popularity");
  }, [onFilter, onSort]);

  return (
    <div className="mb-6 space-y-4">
      {/* Sort Options */}
      <div className={`${cardBg} ${cardBorder} border rounded-xl p-4`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`${text} font-bold`}>Sort By</h3>
          <span className="text-gray-400 text-sm">{totalMovies} movies</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { value: "popularity", label: "Popularity" },
            { value: "rating", label: "Highest Rated" },
            { value: "newest", label: "Newest" },
            { value: "oldest", label: "Oldest" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`px-3 py-2 rounded-lg font-medium transition-all ${
                sortBy === option.value
                  ? `${buttonBg} text-white`
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`w-full px-4 py-2 rounded-lg font-semibold transition-all ${
          showFilters
            ? `${buttonBg} text-white`
            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
        }`}
      >
        {showFilters ? "Hide Filters" : "Show Advanced Filters"}
      </button>

      {/* Filter Options */}
      {showFilters && (
        <div className={`${cardBg} ${cardBorder} border rounded-xl p-4 space-y-4`}>
          {/* Genre Filter */}
          <div>
            <label className={`${text} block font-semibold mb-2`}>Genre</label>
            <select
              value={filters.genre}
              onChange={(e) => handleFilterChange("genre", e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`${text} block font-semibold mb-2`}>
                Min Rating
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={filters.ratingMin}
                onChange={(e) =>
                  handleFilterChange("ratingMin", parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className={`${text} block font-semibold mb-2`}>
                Max Rating
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={filters.ratingMax}
                onChange={(e) =>
                  handleFilterChange("ratingMax", parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Year Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`${text} block font-semibold mb-2`}>
                From Year
              </label>
              <input
                type="number"
                min="1900"
                value={filters.yearMin}
                onChange={(e) =>
                  handleFilterChange("yearMin", parseInt(e.target.value))
                }
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className={`${text} block font-semibold mb-2`}>
                To Year
              </label>
              <input
                type="number"
                max={new Date().getFullYear()}
                value={filters.yearMax}
                onChange={(e) =>
                  handleFilterChange("yearMax", parseInt(e.target.value))
                }
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="w-full px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-600"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
