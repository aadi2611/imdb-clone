import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "./ThemeContext";
import { useAuth } from "./AuthContext";
import { addReview, getMovieReviews, deleteReview, getAverageRating } from "./reviewsService";

export function ReviewsSection({ movieId }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);

  const { user } = useAuth();
  const { text, cardBg, cardBorder, buttonBg } = useTheme();

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const [reviewsData, avgRating] = await Promise.all([
        getMovieReviews(movieId),
        getAverageRating(movieId),
      ]);
      setReviews(reviewsData);
      setAverageRating(avgRating);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = useCallback(
    async (e) => {
      e.preventDefault();
      if (!user) {
        setError("Please login to post a review");
        return;
      }
      if (userRating === 0) {
        setError("Please select a rating");
        return;
      }

      setSubmitting(true);
      setError(null);
      try {
        await addReview(
          movieId,
          user.uid,
          user.displayName || user.email,
          userRating,
          userComment
        );
        setUserRating(0);
        setUserComment("");
        await fetchReviews();
      } catch (err) {
        setError("Failed to submit review");
        console.error(err);
      } finally {
        setSubmitting(false);
      }
    },
    [user, userRating, userComment, movieId, fetchReviews]
  );

  const handleDeleteReview = useCallback(
    async (reviewId) => {
      try {
        await deleteReview(reviewId);
        await fetchReviews();
      } catch (err) {
        setError("Failed to delete review");
      }
    },
    [fetchReviews]
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="mt-12 space-y-8">
      {/* Average Rating */}
      <div className={`${cardBg} ${cardBorder} border rounded-xl p-6`}>
        <h3 className={`${text} text-2xl font-bold mb-4`}>
          Community Rating
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-5xl font-bold text-yellow-400">{averageRating}</div>
          <div>
            <div className="flex gap-1 mb-2">
              {[...Array(10)].map((_, i) => (
                <span key={i} className={i < Math.round(averageRating) ? "text-yellow-400" : "text-gray-500"}>
                  ★
                </span>
              ))}
            </div>
            <p className="text-gray-400">{reviews.length} reviews</p>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {user && (
        <div className={`${cardBg} ${cardBorder} border rounded-xl p-6`}>
          <h3 className={`${text} text-xl font-bold mb-4`}>Share Your Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Rating Stars */}
            <div>
              <label className={`${text} block mb-2`}>Your Rating (1-10)</label>
              <div className="flex gap-2">
                {[...Array(10)].map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setUserRating(i + 1)}
                    onMouseEnter={() => setHoverRating(i + 1)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={`text-3xl transition-colors ${
                      i < (hoverRating || userRating)
                        ? "text-yellow-400"
                        : "text-gray-500"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className={`${text} block mb-2`}>Your Review</label>
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Share your thoughts about this movie..."
                maxLength={500}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24"
              />
              <p className="text-gray-400 text-sm mt-1">
                {userComment.length}/500
              </p>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full ${buttonBg} text-white py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50`}
            >
              {submitting ? "Submitting..." : "Post Review"}
            </button>
          </form>
        </div>
      )}

      {!user && (
        <div className={`${cardBg} ${cardBorder} border rounded-xl p-6 text-center`}>
          <p className={`${text} mb-3`}>Login to post a review</p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className={`${text} text-xl font-bold`}>Reviews ({reviews.length})</h3>
        {loading ? (
          <p className="text-gray-400">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-400">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className={`${cardBg} ${cardBorder} border rounded-xl p-6`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className={`${text} font-bold`}>{review.userName}</p>
                  <p className="text-gray-400 text-sm">{formatDate(review.createdAt)}</p>
                </div>
                <div className="flex gap-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-300">{review.comment}</p>
              {user && user.uid === review.userId && (
                <button
                  onClick={() => handleDeleteReview(review.id)}
                  className="text-red-500 hover:text-red-400 text-sm mt-3"
                >
                  Delete
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
