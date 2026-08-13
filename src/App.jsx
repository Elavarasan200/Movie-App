import { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import FALLBACK_MOVIES from './data/movies';

const API_URL = '/api/movies';

function App() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem('movie-favorites');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    const fetchMovies = async () => {
      const url = `${API_URL}?page=${page}&search=${encodeURIComponent(search)}`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        setMovies(data.movies || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        // Backend not reachable (e.g. running locally). Use fallback static data.
        const q = (search || '').trim().toLowerCase();
        const filtered = FALLBACK_MOVIES.filter((m) => {
          const hay = `${m.title} ${m.overview}`.toLowerCase();
          return hay.includes(q);
        });
        const pageSize = 4;
        const total = Math.max(1, Math.ceil(filtered.length / pageSize));
        const safePage = Math.min(page, total);
        const start = (safePage - 1) * pageSize;
        setMovies(filtered.slice(start, start + pageSize));
        setTotalPages(total);
      }
    };

    fetchMovies();
  }, [page, search]);

  useEffect(() => {
    localStorage.setItem('movie-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (movie) => {
    setFavorites((current) => {
      const exists = current.some((item) => item.id === movie.id);
      return exists ? current.filter((item) => item.id !== movie.id) : [...current, movie];
    });
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>Movie Explorer</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/favorites">Favorites ({favorites.length})</Link>
        </nav>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <main>
              <section className="toolbar">
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search movies"
                />
              </section>

              <section className="movie-grid">
                {movies.map((movie) => {
                  const isFavorite = favorites.some((item) => item.id === movie.id);
                  return (
                    <article key={movie.id} className="movie-card">
                      <img src={movie.poster} alt={movie.title} />
                      <div className="card-body">
                        <h3>{movie.title}</h3>
                        <p>{movie.overview}</p>
                        <div className="meta">
                          <span>{movie.releaseDate}</span>
                          <span>⭐ {movie.rating}</span>
                        </div>
                        <button onClick={() => toggleFavorite(movie)}>
                          {isFavorite ? '★ Remove' : '☆ Favorite'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </section>

              <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </button>
              </div>
            </main>
          }
        />

        <Route
          path="/favorites"
          element={
            <main>
              <h2>Favorite Movies</h2>
              {favorites.length === 0 ? (
                <p>No favorites saved yet.</p>
              ) : (
                <section className="movie-grid">
                  {favorites.map((movie) => (
                    <article key={movie.id} className="movie-card">
                      <img src={movie.poster} alt={movie.title} />
                      <div className="card-body">
                        <h3>{movie.title}</h3>
                        <p>{movie.overview}</p>
                        <button onClick={() => toggleFavorite(movie)}>Remove</button>
                      </div>
                    </article>
                  ))}
                </section>
              )}
            </main>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
