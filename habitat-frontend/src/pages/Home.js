import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import {
  clearMovieError,
  getAllMovies,
  getMoviesByFormat,
  getMoviesByGenre,
  getMoviesByLanguage,
} from "../redux/actions/movieActions";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "../components/MovieCard";

const pickTitle = (movie) => {
  if (!movie || typeof movie !== "object") return "Untitled";
  return (
    movie.title ||
    movie.name ||
    movie.movieName ||
    movie.movieTitle ||
    movie.movie_name ||
    movie.movie_title ||
    `Movie #${movie.movieId ?? movie.id ?? ""}`.trim() ||
    "Untitled"
  );
};

const pickMeta = (movie) => {
  if (!movie || typeof movie !== "object") return "";
  const genre = movie.genre || movie.genreName || movie.movieGenre || null;
  const language = movie.language || movie.languageName || movie.movieLanguage || null;
  const format = movie.format || movie.formatName || movie.movieFormat || null;

  return [genre, language, format].filter(Boolean).join(" • ");
};

const pickPosterSrc = (movie) => {
  if (!movie || typeof movie !== "object") return null;
  return (
    movie.moviePoster ||
    movie.movie_poster ||
    movie.posterUrl ||
    null
  );
};

const resolvePosterUrl = (rawValue, apiBaseUrl) => {
  if (!rawValue) return null;

  // Base64 support: either already a data URL or raw base64.
  if (typeof rawValue === "string") {
    const value = rawValue.trim();
    if (!value) return null;
    if (value.startsWith("data:image/")) return value;

    // If DB stores raw base64 (no data: prefix), convert it.
    // Heuristic: long-ish string consisting only of base64 chars (plus optional padding).
    const looksLikeBase64 =
      value.length >= 64 &&
      /^[A-Za-z0-9+/]+={0,2}$/.test(value) &&
      value.length % 4 === 0;
    if (looksLikeBase64) {
      return `data:image/jpeg;base64,${value}`;
    }

    if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("blob:")) return value;

    // If it looks like a path, keep it relative so CRA proxy can serve it,
    // or prefix with REACT_APP_API_BASE_URL when provided.
    const base = (apiBaseUrl || "").replace(/\/$/, "");
    if (value.startsWith("/")) return base ? `${base}${value}` : value;
    // bare filename or folder path
    return base ? `${base}/${value}` : `/${value}`;
  }

  return null;
};

const pickCertificate = (movie) => {
  if (!movie || typeof movie !== "object") return null;
  return (
    movie.certificate ||
    movie.certification ||
    movie.ageRating ||
    movie.ratingCertificate ||
    movie.ua ||
    null
  );
};

const pickLanguagesLabel = (movie) => {
  if (!movie || typeof movie !== "object") return null;
  const raw =
    movie.languages ||
    movie.languageList ||
    movie.availableLanguages ||
    movie.language ||
    movie.languageName ||
    movie.movieLanguage ||
    null;

  if (!raw) return null;
  if (Array.isArray(raw)) {
    return raw
      .map((l) => (typeof l === "object" ? l.name || l.languageName : l))
      .filter(Boolean)
      .join(", ");
  }
  if (typeof raw === "string") return raw;
  return null;
};

const pickAvgRatingLabel = (movie) => {
  if (!movie || typeof movie !== "object") return null;
  const raw =
    movie.avgRating ??
    movie.averageRating ??
    movie.rating ??
    movie.imdbRating ??
    movie.avg_rating ??
    null;

  if (raw == null) return null;
  const num = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(num)) return null;
  // Keep it compact for the overlay.
  return num % 1 === 0 ? `${num.toFixed(0)}` : `${num.toFixed(1)}`;
};

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const movieList = useSelector((state) => state.movieList || {});
  const moviesByGenre = useSelector((state) => state.moviesByGenre || {});
  const moviesByLanguage = useSelector((state) => state.moviesByLanguage || {});
  const moviesByFormat = useSelector((state) => state.moviesByFormat || {});

  const [browseMode, setBrowseMode] = useState("all"); // all | genre | language | format
  const apiBaseUrl = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");

  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");

  const [genreOptions, setGenreOptions] = useState([]);
  const [genreOptionsLoading, setGenreOptionsLoading] = useState(false);

  const [languageOptions, setLanguageOptions] = useState([]);
  const [languageOptionsLoading, setLanguageOptionsLoading] = useState(false);

  const [formatOptions, setFormatOptions] = useState([]);
  const [formatOptionsLoading, setFormatOptionsLoading] = useState(false);

  const [showAll, setShowAll] = useState(false);
  const LIMIT = 10;

  useEffect(() => {
    if (location.state?.filterLanguage) {
      const lang = location.state.filterLanguage;
      setSelectedLanguage(lang);
      setSelectedGenre("");
      setSelectedFormat("");
      setBrowseMode("language");
      dispatch(getMoviesByLanguage(lang));
      // Clear state so it doesn't re-filter on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, dispatch]);

  const scrollerRef = useRef(null);
  const carouselWrapRef = useRef(null);
  const [arrowCenterTop, setArrowCenterTop] = useState(null);

  useEffect(() => {
    dispatch(getAllMovies());
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;

    const normalizeGenreOption = (g) => {
      if (!g) return null;
      if (typeof g === "string") {
        const value = g.trim();
        if (!value) return null;
        return { value, label: value };
      }
      if (typeof g !== "object") return null;

      const name =
        g.genreName ||
        g.name ||
        g.genre ||
        g.genre_name ||
        g.genreTitle ||
        g.genre_title ||
        null;

      const id = g.genreId ?? g.id ?? g.genre_id ?? null;
      const value = (name ?? (id != null ? String(id) : "")).trim();
      if (!value) return null;

      const label = name ? String(name).trim() : `Genre ${value}`;
      return { value, label };
    };

    const loadGenres = async () => {
      try {
        setGenreOptionsLoading(true);
        const { data } = await api.get("/genres/getall");

        const raw = Array.isArray(data) ? data : [];
        const options = raw.map(normalizeGenreOption).filter(Boolean);

        // de-dupe by value + sort by label
        const deduped = new Map();
        for (const opt of options) {
          if (!deduped.has(opt.value)) deduped.set(opt.value, opt);
        }
        const unique = Array.from(deduped.values());
        unique.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));

        if (isMounted) setGenreOptions(unique);
      } catch {
        // Keep the dropdown functional via fallback (derived genres from movies)
        if (isMounted) setGenreOptions([]);
      } finally {
        if (isMounted) setGenreOptionsLoading(false);
      }
    };

    loadGenres();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const normalizeFormatOption = (f) => {
      if (!f) return null;
      if (typeof f === "string") {
        const value = f.trim();
        if (!value) return null;
        return { value, label: value };
      }
      if (typeof f !== "object") return null;

      const name =
        f.formatName ||
        f.name ||
        f.format ||
        f.format_name ||
        f.formatTitle ||
        f.format_title ||
        null;
      const id = f.formatId ?? f.id ?? f.format_id ?? null;

      const value = (name ?? (id != null ? String(id) : "")).trim();
      if (!value) return null;
      const label = name ? String(name).trim() : `Format ${value}`;
      return { value, label };
    };

    const loadFormats = async () => {
      try {
        setFormatOptionsLoading(true);
        const { data } = await api.get("/format/getall");

        const raw = Array.isArray(data) ? data : [];
        const options = raw.map(normalizeFormatOption).filter(Boolean);

        const deduped = new Map();
        for (const opt of options) {
          if (!deduped.has(opt.value)) deduped.set(opt.value, opt);
        }
        const unique = Array.from(deduped.values());
        unique.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));

        if (isMounted) setFormatOptions(unique);
      } catch {
        if (isMounted) setFormatOptions([]);
      } finally {
        if (isMounted) setFormatOptionsLoading(false);
      }
    };

    loadFormats();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const normalizeLanguageOption = (l) => {
      if (!l) return null;
      if (typeof l === "string") {
        const value = l.trim();
        if (!value) return null;
        return { value, label: value };
      }
      if (typeof l !== "object") return null;

      const name =
        l.languageName ||
        l.name ||
        l.language ||
        l.language_name ||
        l.languageTitle ||
        l.language_title ||
        null;
      const id = l.languageId ?? l.id ?? l.language_id ?? null;

      const value = (name ?? (id != null ? String(id) : "")).trim();
      if (!value) return null;
      const label = name ? String(name).trim() : `Language ${value}`;
      return { value, label };
    };

    const loadLanguages = async () => {
      try {
        setLanguageOptionsLoading(true);
        const { data } = await api.get("/language/getall");

        const raw = Array.isArray(data) ? data : [];
        const options = raw.map(normalizeLanguageOption).filter(Boolean);

        const deduped = new Map();
        for (const opt of options) {
          if (!deduped.has(opt.value)) deduped.set(opt.value, opt);
        }
        const unique = Array.from(deduped.values());
        unique.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));

        if (isMounted) setLanguageOptions(unique);
      } catch {
        if (isMounted) setLanguageOptions([]);
      } finally {
        if (isMounted) setLanguageOptionsLoading(false);
      }
    };

    loadLanguages();
    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedMovies = useMemo(() => {
    if (!Array.isArray(movieList.movies)) return [];
    return movieList.movies;
  }, [movieList.movies]);

  const availableOptions = useMemo(() => {
    const genres = new Set();
    const languages = new Set();
    const formats = new Set();

    for (const movie of normalizedMovies) {
      if (!movie || typeof movie !== "object") continue;
      const genre = movie.genre || movie.genreName || movie.movieGenre || null;
      const language = movie.language || movie.languageName || movie.movieLanguage || null;
      const format = movie.format || movie.formatName || movie.movieFormat || null;

      if (genre) genres.add(String(genre));
      if (language) languages.add(String(language));
      if (format) formats.add(String(format));
    }

    const sortAlpha = (a, b) => a.localeCompare(b, undefined, { sensitivity: "base" });

    return {
      genres: Array.from(genres).sort(sortAlpha),
      languages: Array.from(languages).sort(sortAlpha),
      formats: Array.from(formats).sort(sortAlpha),
    };
  }, [normalizedMovies]);

  const genresForDropdown = useMemo(() => {
    if (genreOptionsLoading) return [];
    if (genreOptions.length) return genreOptions;
    return availableOptions.genres.map((g) => ({ value: String(g), label: String(g) }));
  }, [availableOptions.genres, genreOptions, genreOptionsLoading]);

  const languagesForDropdown = useMemo(() => {
    if (languageOptionsLoading) return [];
    if (languageOptions.length) return languageOptions;
    return availableOptions.languages.map((l) => ({ value: String(l), label: String(l) }));
  }, [availableOptions.languages, languageOptions, languageOptionsLoading]);

  const formatsForDropdown = useMemo(() => {
    if (formatOptionsLoading) return [];
    if (formatOptions.length) return formatOptions;
    return availableOptions.formats.map((f) => ({ value: String(f), label: String(f) }));
  }, [availableOptions.formats, formatOptions, formatOptionsLoading]);

  const activeSlice = useMemo(() => {
    if (browseMode === "genre") return moviesByGenre;
    if (browseMode === "language") return moviesByLanguage;
    if (browseMode === "format") return moviesByFormat;
    return movieList;
  }, [browseMode, movieList, moviesByFormat, moviesByGenre, moviesByLanguage]);

      const activeMovies = useMemo(() => {
    if (!Array.isArray(activeSlice.movies)) return [];
    return activeSlice.movies;
  }, [activeSlice.movies]);

  const displayedMovies = useMemo(() => {
    if (showAll || activeMovies.length <= LIMIT) return activeMovies;
    return activeMovies.slice(0, LIMIT);
  }, [activeMovies, showAll]);

  const activeLoading = !!activeSlice.loading;
  const activeError = activeSlice.error;

  const scrollByCards = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;

    // We want to scroll by 5 cards + their gaps
    const card = el.querySelector("[data-movie-card='true']");
    const cardWidth = card ? card.getBoundingClientRect().width : 160;
    const gap = 16;
    const scrollAmount = (cardWidth + gap) * 5;

    el.scrollBy({ left: dir * scrollAmount, behavior: "smooth" });
  };

  useEffect(() => {
    const wrap = carouselWrapRef.current;
    const scroller = scrollerRef.current;
    if (!wrap || !scroller) return;

    const update = () => {
      const poster = scroller.querySelector("[data-movie-poster='true']");
      if (!poster) {
        setArrowCenterTop(null);
        return;
      }

      const wrapRect = wrap.getBoundingClientRect();
      const posterRect = poster.getBoundingClientRect();
      const nextTop = posterRect.top - wrapRect.top + posterRect.height / 2;
      if (!Number.isFinite(nextTop)) {
        setArrowCenterTop(null);
        return;
      }
      setArrowCenterTop(nextTop);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [activeLoading, activeMovies.length]);

  const SkeletonCard = () => (
    <div className="w-40 shrink-0 overflow-hidden rounded-3xl">
      <div className="relative aspect-[9/16] bg-slate-100 dark:bg-slate-800" data-movie-poster="true">
        <div className="absolute inset-x-0 bottom-0 h-12 bg-black/60" />
      </div>
      <div className="space-y-2 p-4">
        <div className="h-5 w-11/12 rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-4 w-6/12 rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-4 w-10/12 rounded bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Habitat
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100 sm:text-3xl">
              Find your next show
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Explore what's playing near you. Browse all movies and pick your favorite.
            </p>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4 text-left dark:bg-slate-950">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</div>
              <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {activeLoading ? "Loading..." : "Ready"}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-left dark:bg-slate-950">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Movies</div>
              <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {Array.isArray(activeMovies) ? activeMovies.length : 0}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Now Showing</h2>
        </div>
        {activeMovies.length > LIMIT && (
          <button
            onClick={() => navigate("/movies/explore")}
            className="group flex items-center gap-1 text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors"
          >
            See all
            <ChevronRight 
              size={16} 
              className="group-hover:translate-x-0.5 transition-transform duration-300" 
            />
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Browse by genre</div>
          <select
            value={selectedGenre}
            onChange={(e) => {
              const next = e.target.value;
              dispatch(clearMovieError());
              setSelectedGenre(next);
              setSelectedLanguage("");
              setSelectedFormat("");
              if (!next) {
                setBrowseMode("all");
                return;
              }
              setBrowseMode("genre");
              dispatch(getMoviesByGenre(next));
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">All genres</option>
            {genreOptionsLoading ? <option disabled>Loading…</option> : null}
            {genresForDropdown.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Browse by language</div>
          <select
            value={selectedLanguage}
            onChange={(e) => {
              const next = e.target.value;
              dispatch(clearMovieError());
              setSelectedLanguage(next);
              setSelectedGenre("");
              setSelectedFormat("");
              if (!next) {
                setBrowseMode("all");
                return;
              }
              setBrowseMode("language");
              dispatch(getMoviesByLanguage(next));
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">All languages</option>
            {languageOptionsLoading ? <option disabled>Loading…</option> : null}
            {languagesForDropdown.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <div className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-300">Browse by format</div>
          <select
            value={selectedFormat}
            onChange={(e) => {
              const next = e.target.value;
              dispatch(clearMovieError());
              setSelectedFormat(next);
              setSelectedGenre("");
              setSelectedLanguage("");
              if (!next) {
                setBrowseMode("all");
                return;
              }
              setBrowseMode("format");
              dispatch(getMoviesByFormat(next));
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">All formats</option>
            {formatOptionsLoading ? <option disabled>Loading…</option> : null}
            {formatsForDropdown.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {activeError ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {typeof activeError === "string" ? activeError : "Failed to load movies."}
        </div>
      ) : (
        <div ref={carouselWrapRef} className="relative mt-6">
          {!activeLoading && activeMovies.length > 0 ? (
            <>
              <button
                type="button"
                onClick={() => scrollByCards(-1)}
                aria-label="Scroll left"
                style={{ top: arrowCenterTop != null ? `${arrowCenterTop}px` : "50%" }}
                className="absolute left-2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 p-2 text-slate-700 shadow-sm backdrop-blur hover:bg-white sm:inline-flex dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={() => scrollByCards(1)}
                aria-label="Scroll right"
                style={{ top: arrowCenterTop != null ? `${arrowCenterTop}px` : "50%" }}
                className="absolute right-2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/90 p-2 text-slate-700 shadow-sm backdrop-blur hover:bg-white sm:inline-flex dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                <ChevronRight size={18} />
              </button>
            </>
          ) : null}

          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto scroll-smooth px-3 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6"
            aria-label="Movie carousel"
          >
            {activeLoading ? (
              Array.from({ length: 6 }).map((_, idx) => <SkeletonCard key={idx} />)
            ) : null}

            {displayedMovies.map((movie) => {
              const movieId = movie?.movieId ?? movie?.id ?? null;
              const key = movieId ?? pickTitle(movie);
              const title = pickTitle(movie);
              const meta = pickMeta(movie);
              const posterSrc = resolvePosterUrl(pickPosterSrc(movie), apiBaseUrl);
              const certificate = pickCertificate(movie);
              const languagesLabel = pickLanguagesLabel(movie);
              const avgRatingLabel = pickAvgRatingLabel(movie);

              return (
                <MovieCard
                  key={key}
                  movieId={movieId}
                  title={title}
                  posterSrc={posterSrc}
                  certificate={certificate}
                  languagesLabel={languagesLabel}
                  meta={meta}
                  avgRatingLabel={avgRatingLabel}
                  onClick={() => {
                    if (!movieId) return;
                    navigate(`/movies/${movieId}`);
                  }}
                />
              );
            })}

            {!activeLoading && activeMovies.length === 0 ? (
              <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                No movies found.
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
