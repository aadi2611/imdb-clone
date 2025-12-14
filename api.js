// Small API service that fetches popular movies from TMDB when an API key
// is provided via `import.meta.env.VITE_TMDB_API_KEY`. Falls back to local
// assets if no key is present.

export async function fetchPopularMovies({ signal } = {}) {
  const key = import.meta.env.VITE_TMDB_API_KEY;

  if (key) {
    const url = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=1&api_key=${key}`;
    const res = await fetch(url, { signal });
    if (!res.ok) {
      throw new Error(`TMDB fetch failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return (data.results || []).map((item) => ({
      id: item.id,
      title: item.title || item.original_title || 'Untitled',
      year: item.release_date ? item.release_date.split('-')[0] : 'N/A',
      rating: Math.round((item.vote_average || 0) / 2),
      poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
    }));
  }

  // Fallback: return a small set of local assets so the app works without keys.
  return [
    { id: '1', title: 'Inception', year: 2010, rating: 5, poster: '/src/assets/Inception.jpg' },
    { id: '2', title: 'Interstellar', year: 2014, rating: 4, poster: '/src/assets/Interstellar.jpg' },
    { id: '3', title: 'The Dark Knight', year: 2008, rating: 5, poster: '/src/assets/DarkKnight.jpg' },
  ];
}
