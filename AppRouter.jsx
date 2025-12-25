import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./ThemeContext";
import Navigation from "./Navigation";
import Home from "./Home";
import MovieDetails from "./MovieDetails";
import Favorites from "./Favorites";
import { useFavorites } from "./useFavorites";

function AppRouter() {
  const { favorites } = useFavorites();

  return (
    <Router>
      <ThemeProvider>
        <Navigation favoriteCount={favorites.length} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:movieId" element={<MovieDetails />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default AppRouter;
