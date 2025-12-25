import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { useFavorites } from "./useFavorites";

const PLACEHOLDER = "https://via.placeholder.com/300x450/1a1a2e/00d4ff?text=No+Image";

function MovieCard({ poster, title, year, rating, id }) {
  const navigate = useNavigate();
  const { cardBg, cardBorder, text } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const src = poster || PLACEHOLDER;
  const isFav = isFavorite(id);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite({ id, poster, title, year, rating });
  };

  const handleCardClick = () => {
    if (id) {
      navigate(`/movie/${id}`);
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className={`${cardBg} ${cardBorder} rounded-xl shadow-md hover:shadow-2xl border overflow-hidden w-full max-w-sm transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 group cursor-pointer relative`}
    >
      <div className="relative overflow-hidden h-72 bg-gradient-to-br from-gray-400 to-gray-600">
        <img
          src={src}
          alt={title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
          {rating}⭐
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 left-3 text-3xl transition-all duration-300 transform hover:scale-125 active:scale-95"
          title={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          {isFav ? "❤️" : "🤍"}
        </button>
      </div>

      <div className="p-5">
        <h2 className={`${text} text-lg font-bold line-clamp-2 transition-colors duration-300`}>
          {title}
        </h2>
        <p className="text-gray-400 text-sm mt-2 font-medium">{year}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900 rounded-full">
            <span className="text-indigo-700 dark:text-indigo-300 text-xs font-semibold">Movie</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default React.memo(MovieCard);
