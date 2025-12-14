import React, { useEffect, useState } from "react";
import MovieCard from "./MovieCard";
import SearchBar from "./SearchBar";
import { fetchPopularMovies, searchMovies } from "./api";

function App() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchPopularMovies({ signal: controller.signal })
      .then((data) => setMovies(data))
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message || "Failed to load movies");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  // Search handling: abort previous request and call searchMovies
  const handleSearch = (query) => {
    // if empty search, load popular
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const promise = query ? searchMovies(query, { signal: controller.signal }) : fetchPopularMovies({ signal: controller.signal });

    promise
      .then((data) => setMovies(data))
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message || "Failed to load search results");
      })
      .finally(() => setLoading(false));

    // return abort so SearchBar consumer could use if needed — but here we ignore
    return () => controller.abort();
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-white">
        🎬 Movie Collection
      </h1>

      <SearchBar onSearch={handleSearch} debounceMs={450} />

      {loading && <p className="text-center text-gray-300">Loading movies…</p>}
      {error && <p className="text-center text-red-400">{error}</p>}

      {!loading && movies.length === 0 && <p className="text-center text-gray-400">No Results Found</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((m) => (
          <MovieCard key={m.id ?? m.title} poster={m.poster} title={m.title} year={m.year} rating={m.rating} />
        ))}
      </div>
    </div>
  );
}

export default App;
