import React from "react";

const PLACEHOLDER = "https://via.placeholder.com/300x450/1a1a2e/00d4ff?text=No+Image";

function MovieCard({ poster, title, year, rating }) {
  const src = poster || PLACEHOLDER;

  return (
    <article className="bg-gray-800 rounded-lg shadow-lg overflow-hidden w-full max-w-xs border border-gray-700">
      <img
        src={src}
        alt={title}
        loading="lazy"
        decoding="async"
        className="w-full object-cover"
        style={{ height: 384 }}
      />

      <div className="p-4">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="text-gray-400">{year}</p>
        <div className="mt-2 flex items-center">
          <span className="text-yellow-400 text-xl" aria-hidden>
            ★
          </span>
          <span className="ml-2 text-gray-300 font-semibold">{rating}/5</span>
        </div>
      </div>
    </article>
  );
}

export default React.memo(MovieCard);
