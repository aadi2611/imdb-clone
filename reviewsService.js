import { db } from "./firebase-config";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  average,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

// Add a review to a movie
export async function addReview(movieId, userId, userName, rating, comment) {
  try {
    const reviewsRef = collection(db, "reviews");
    const docRef = await addDoc(reviewsRef, {
      movieId: String(movieId),
      userId,
      userName,
      rating: Math.min(Math.max(rating, 1), 10), // Ensure 1-10
      comment,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
}

// Fetch all reviews for a movie
export async function getMovieReviews(movieId) {
  try {
    const reviewsRef = collection(db, "reviews");
    const q = query(
      reviewsRef,
      where("movieId", "==", String(movieId)),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

// Calculate average rating for a movie
export async function getAverageRating(movieId) {
  try {
    const reviews = await getMovieReviews(movieId);
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  } catch (error) {
    console.error("Error calculating average rating:", error);
    return 0;
  }
}

// Delete a review
export async function deleteReview(reviewId) {
  try {
    await deleteDoc(doc(db, "reviews", reviewId));
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
}

// Update a review
export async function updateReview(reviewId, rating, comment) {
  try {
    const reviewRef = doc(db, "reviews", reviewId);
    await updateDoc(reviewRef, {
      rating: Math.min(Math.max(rating, 1), 10),
      comment,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
}
