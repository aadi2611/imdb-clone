import React, { useEffect, useState } from "react";
import MovieCard from "./MovieCard";
import { fetchPopularMovies } from "./api";

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

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-white">
        🎬 Movie Collection
      </h1>

      {loading && <p className="text-center text-gray-300">Loading movies…</p>}
      {error && <p className="text-center text-red-400">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movies.map((m) => (
          <MovieCard key={m.id ?? m.title} poster={m.poster} title={m.title} year={m.year} rating={m.rating} />
        ))}
      </div>
    </div>
  );
}

export default App;
