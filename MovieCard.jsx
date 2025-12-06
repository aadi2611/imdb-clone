import React from "react";

function MovieCard({ poster, title, year, rating }) {
  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden transform hover:scale-105 transition duration-300 cursor-pointer w-60">
      <img
        src={poster}
        alt={title}
        className="w-full h-80 object-cover"
      />

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{title}</h3>

        <p className="text-sm text-gray-500">Released: {year}</p>

        {/* Rating */}
        <div className="flex items-center mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-yellow-400 ${
                star <= rating ? "" : "text-gray-300"
              } text-xl`}
            >
              ★
            </span>
          ))}
          <span className="ml-2 text-gray-600 text-sm">{rating}/5</span>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
