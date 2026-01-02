import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {Share2, ThumbsUp, StarsIcon, Star} from "lucide-react";
import {getMovieById, getMoviesByLanguage, clearMovieError, getMoviesByGenre, getMoviesByFormat} from "../redux/actions/movieActions";
import api from "../api/axios";

const pickTitle = (movie) => {
  if (!movie || typeof movie !== "object") return "Movie";
  return movie.movieName || movie.title || movie.name || "Movie";
};

const pickPosterSrc = (movie) => {
  if (!movie || typeof movie !== "object") return null;
  return (
    movie.moviePoster ||
    movie.movie_poster ||
    movie.posterUrl ||
    movie.posterURL ||
    movie.poster_url ||
    movie.posterPath ||
    movie.poster_path ||
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
const resolvePosterUrl = (rawValue, apiBaseUrl) => {
  if (!rawValue) return null;
  if (typeof rawValue !== "string") return null;
  const value = rawValue.trim();
  if (!value) return null;
  if (value.startsWith("data:image/")) return value;
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("blob:")) return value;

  const base = (apiBaseUrl || "").replace(/\/$/, "");
  if (value.startsWith("/")) return base ? `${base}${value}` : value;
  return base ? `${base}/${value}` : `/${value}`;
};

const minutesToDuration = (minutes) => {
  const m = Number(minutes);
  if (!Number.isFinite(m) || m <= 0) return null;
  const hours = Math.floor(m / 60);
  const mins = Math.round(m % 60);
  if (hours <= 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
};

const formatReleaseDate = (value) => {
  if (!value) return null;
  // Spring LocalDate typically serializes as YYYY-MM-DD
  const d = new Date(`${value}T00:00:00`);
  if (!Number.isFinite(d.getTime())) return String(value);

  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).formatToParts(d);

  const day = parts.find((p) => p.type === "day")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const year = parts.find((p) => p.type === "year")?.value;

  if (!day || !month || !year) return String(value);
  return `${day} ${month}, ${year}`;
};

const extractNames = (value, fallbackKey) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item) return null;
        if (typeof item === "string") return item;
        if (typeof item === "object") {
          return (
            item.name ||
            item[fallbackKey] ||
            item[`${fallbackKey}Name`] ||
            item[`${fallbackKey}_name`] ||
            null
          );
        }
        return null;
      })
      .filter(Boolean);
  }
  // Sometimes backend could send a single string.
  if (typeof value === "string") return [value];
  return [];
};

export default function MovieDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, movie, error } = useSelector((state) => state.movieDetails || {});

  useEffect(() => {
    if (id) dispatch(getMovieById(id));
  }, [dispatch, id]);

  const apiBaseUrl = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");

  const title = useMemo(() => pickTitle(movie), [movie]);
  const posterSrc = useMemo(() => resolvePosterUrl(pickPosterSrc(movie), apiBaseUrl), [movie, apiBaseUrl]);

  const durationLabel = minutesToDuration(movie?.durationMinutes);
  const certificate = movie?.certificate || null;
  const releaseDate = movie?.releaseDate ? formatReleaseDate(movie.releaseDate) : null;

  const genres = extractNames(movie?.genres, "genre");
  const formats = extractNames(movie?.formats, "format");
  const languages = extractNames(movie?.languages, "language");

  const [ratingsCount, setRatingsCount] = useState(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    api.get(`/ratings/count/${id}`)
        .then(res => {
          if (!cancelled) setRatingsCount(res.data);
        })
        .catch(() => {
          if (!cancelled) setRatingsCount(0);
        });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const formatAvgRating = (count) => {
    if (count == null) return null;
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M+`;
    if (count >= 1_000) return `${Math.floor(count / 1_000)}K+`;
    return `${count}`;
  };

  const votesLabel = useMemo(
      () => formatAvgRating(ratingsCount),
      [ratingsCount]
  );

  const avgRatingLabel = useMemo(
      () => formatAvgRating(movie?.avgRating),
      [movie?.avgRating]
  );

  const handleGenreClick = (genre) => {
    dispatch(clearMovieError());
    dispatch(getMoviesByGenre(genre));
    navigate("/", { state: { filterGenre: genre } });
  };

  const handleLanguageClick = (lang) => {
    dispatch(clearMovieError());
    dispatch(getMoviesByLanguage(lang));
    navigate("/", { state: { filterLanguage: lang } });
  };

  const handleFormatClick = (format) => {
    dispatch(clearMovieError());
    dispatch(getMoviesByFormat(format));
    navigate("/", { state: { filterFormat: format } });
  };

  const heroMetaParts = [durationLabel].filter(Boolean);

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {typeof error === "string" ? error : "Failed to load movie."}
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          {posterSrc ? (
            <img
              src={posterSrc}
              alt={title}
              className="h-full w-full object-cover opacity-40"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="h-full w-full bg-slate-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:py-14">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Poster card */}
            <div className="w-full max-w-xs shrink-0">
              <div className="overflow-hidden rounded-md bg-black/60 shadow-sm">
                <div className="relative aspect-[9/16] bg-slate-800">
                  {posterSrc ? (
                    <img
                      src={posterSrc}
                      alt={title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                    />
                  ) : null}
                  {releaseDate ? (
                    <div className="absolute inset-x-0 bottom-0 bg-black px-4 py-2 text-center text-xs font-semibold text-white">
                      Releasing on {releaseDate}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="min-w-0 flex-1 text-white">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-black/30 px-3 py-2 text-sm font-medium text-white hover:bg-black/40"
                  aria-label="Share"
                >
                  <Share2 size={18} />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <div className="rounded-2xl border-white border-white/60 bg-black/80 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold">
                      <ThumbsUp size={18} className="text-emerald-400" />
                      <span>Interested</span>
                    </div>
                    <div className="text-sm text-white/80">Are you interested in watching this movie?</div>
                    <div className="flex-1" />
                    <button
                      type="button"
                      className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                    >
                      I&apos;m interested
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 text-sm text-white/85">
                  {heroMetaParts.map((part, i) => (
                    <span key={i} className="flex items-center gap-x-2">
                      {part}
                      <span>•</span>
                    </span>
                  ))}

                  {/* Genres */}
                  {genres.map((g, idx) => (
                    <button
                      key={g}
                      onClick={() => handleGenreClick(g)}
                      className="cursor-pointer hover:text-white hover:underline underline-offset-4"
                    >
                      {g}{idx < genres.length - 1 ? "," : ""}
                    </button>
                  ))}
                  <span>•</span>

                  {/* Certificate */}
                  {certificate && (
                    <>
                      <span>{certificate}</span>
                      <span>•</span>
                    </>
                  )}

                  {/* Release date */}
                  {releaseDate && (
                      <>
                        <span>{releaseDate}</span>
                      </>
                  )}
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Star size={28} className="text-red-500" fill="currentColor" />

                  {avgRatingLabel ? (
                      <span className="text-lg font-bold">
      {avgRatingLabel}/10
                        {votesLabel && (
                            <span className="ml-3 text-lg font-semibold text-white/80">
          ({votesLabel} votes)
        </span>
                        )}
    </span>
                  ) : (
                      <span className="text-lg text-white/70">No ratings yet</span>
                  )}
                </div>

                {/* Single Tag Layout for Formats and Languages */}
                <div className="mt-4 flex flex-wrap gap-3">
                  {formats.length > 0 && (
                    <div className="rounded-lg bg-white/20 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                      {formats.map((f, idx) => (
                        <button
                          key={f}
                          onClick={() => handleFormatClick(f)}
                          className="hover:underline underline-offset-2"
                        >
                          {f}{idx < formats.length - 1 ? ", " : ""}
                        </button>
                      ))}
                    </div>
                  )}

                  {languages.length > 0 && (
                    <div className="rounded-lg bg-white/20 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                      {languages.map((l, idx) => (
                        <button
                          key={l}
                          onClick={() => handleLanguageClick(l)}
                          className="hover:underline underline-offset-2"
                        >
                          {l}{idx < languages.length - 1 ? ", " : ""}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  <button
                    type="button"
                    className="w-full max-w-sm rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-500"
                  >
                    Book tickets
                  </button>
                </div>
                <div className="mt-6 max-w-2xl">
                  <h2 className="text-lg font-semibold">About the movie</h2>
                  <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/80">
                    {movie?.movieDescription || "No description available."}
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="mt-6 text-sm text-white/70">Loading…</div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">

      </section>
    </div>
  );
}
