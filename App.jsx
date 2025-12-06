import MovieCard from "./MovieCard";

function App() {
  const movies = [
    {
      title: "Inception",
      year: 2010,
      rating: 5,
      poster:
        "https://m.media-amazon.com/images/I/51nbVEuw1HL._AC_.jpg",
    },
    {
      title: "Interstellar",
      year: 2014,
      rating: 4,
      poster:
        "https://m.media-amazon.com/images/I/71niXI3lxlL._AC_SL1178_.jpg",
    },
    {
      title: "The Dark Knight",
      year: 2008,
      rating: 5,
      poster:
        "https://m.media-amazon.com/images/I/51k0qa6YQmL._AC_.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold text-center mb-8">
        🎬 Movie Collection
      </h1>

      <div className="flex flex-wrap justify-center gap-6">
        {movies.map((m, index) => (
          <MovieCard
            key={index}
            poster={m.poster}
            title={m.title}
            year={m.year}
            rating={m.rating}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
