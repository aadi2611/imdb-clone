import React from "react";
import { useTheme } from "./ThemeContext";

export function SkeletonLoader() {
  const { cardBg } = useTheme();

  return (
    <article className={`${cardBg} rounded-xl shadow-md overflow-hidden w-full max-w-sm animate-pulse`}>
      <div className="relative overflow-hidden h-72 bg-gradient-to-br from-gray-600 to-gray-700">
        <div className="w-full h-full bg-gray-500"></div>
        <div className="absolute top-3 right-3 bg-gray-600 px-3 py-1 rounded-full w-16 h-8"></div>
        <div className="absolute top-3 left-3 w-10 h-10 bg-gray-600 rounded-full"></div>
      </div>
      <div className="p-5 space-y-3">
        <div className="h-6 bg-gray-600 rounded w-3/4"></div>
        <div className="h-4 bg-gray-600 rounded w-1/3"></div>
      </div>
    </article>
  );
}

export function SkeletonMovieDetails() {
  const { cardBg } = useTheme();

  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex gap-6 mb-8">
        <div className="w-48 h-72 bg-gray-600 rounded-xl"></div>
        <div className="flex-1 space-y-4">
          <div className="h-8 bg-gray-600 rounded w-3/4"></div>
          <div className="h-4 bg-gray-600 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-600 rounded w-full"></div>
            <div className="h-4 bg-gray-600 rounded w-5/6"></div>
          </div>
        </div>
      </div>

      {/* Content Skeletons */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-600 rounded w-full"></div>
        <div className="h-4 bg-gray-600 rounded w-full"></div>
        <div className="h-4 bg-gray-600 rounded w-4/5"></div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <SkeletonLoader key={i} />
      ))}
    </div>
  );
}
