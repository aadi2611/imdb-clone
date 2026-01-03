import { useState, useEffect, useCallback } from "react";
import { db } from "./firebase-config";
import { useAuth } from "./AuthContext";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Custom hook for cloud-based watchlist with Firebase sync
 */
export function useCloudWatchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Load watchlist from Firebase
  const loadWatchlist = useCallback(async () => {
    if (!user) {
      setWatchlist([]);
      return;
    }

    setSyncing(true);
    setError(null);
    try {
      const watchlistRef = collection(db, "watchlist");
      const q = query(watchlistRef, where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWatchlist(items);
    } catch (err) {
      console.error("Failed to load watchlist:", err);
      setError("Failed to sync watchlist");
    } finally {
      setSyncing(false);
    }
  }, [user]);

  // Initial load and sync on user change
  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  // Add movie to watchlist
  const addToWatchlist = useCallback(
    async (movie) => {
      if (!user) {
        setError("Please login to add to watchlist");
        return;
      }

      try {
        const watchlistRef = collection(db, "watchlist");
        const q = query(
          watchlistRef,
          where("userId", "==", user.uid),
          where("movieId", "==", movie.id)
        );
        const existing = await getDocs(q);

        if (!existing.empty) {
          setError("Movie already in watchlist");
          return;
        }

        await addDoc(watchlistRef, {
          userId: user.uid,
          movieId: movie.id,
          ...movie,
          addedAt: serverTimestamp(),
          addedDate: new Date().toISOString(),
        });

        await loadWatchlist();
      } catch (err) {
        console.error("Failed to add to watchlist:", err);
        setError("Failed to add to watchlist");
      }
    },
    [user, loadWatchlist]
  );

  // Remove movie from watchlist
  const removeFromWatchlist = useCallback(
    async (movieId) => {
      if (!user) return;

      try {
        const item = watchlist.find((m) => m.movieId === movieId);
        if (item) {
          await deleteDoc(doc(db, "watchlist", item.id));
          await loadWatchlist();
        }
      } catch (err) {
        console.error("Failed to remove from watchlist:", err);
        setError("Failed to remove from watchlist");
      }
    },
    [user, watchlist, loadWatchlist]
  );

  // Check if movie is in watchlist
  const isInWatchlist = useCallback(
    (movieId) => {
      return watchlist.some((m) => m.movieId === movieId);
    },
    [watchlist]
  );

  return {
    watchlist,
    syncing,
    error,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    reloadWatchlist: loadWatchlist,
  };
}
