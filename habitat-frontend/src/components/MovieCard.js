import React from "react";
import { Star } from "lucide-react";

export default function MovieCard({
  movieId,
  title,
  posterSrc,
  certificate,
  languagesLabel,
  meta,
  avgRatingLabel,
  onClick,
}) {
  const isClickable = !!movieId && typeof onClick === "function";

  return (
    <button
      type="button"
      data-movie-card="true"
      onClick={isClickable ? onClick : undefined}
      className={
        "w-56 shrink-0 rounded-2xl overflow-hidden focus:outline-none text-left " +
        (isClickable ? "cursor-pointer" : "cursor-default")
      }
      aria-label={isClickable ? `Open ${title}` : title}
    >
      <div
        className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800"
        data-movie-poster="true"
      >
        {posterSrc ? (
          <img
            src={posterSrc}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : null}

        <div className="absolute inset-x-0 bottom-0">
          <div className="flex items-center gap-2 rounded-b-2xl bg-black/60 px-4 py-3 text-white">
            <Star size={18} className="text-amber-400" fill="currentColor" />
            <div className="text-sm font-semibold">{avgRatingLabel ? avgRatingLabel : "—"}</div>
          </div>
        </div>
      </div>

      <div className="bg-transparent p-4">
        <div className="truncate text-base font-semibold leading-snug text-slate-900 dark:text-slate-100">
          {title}
        </div>

        <div className="mt-2 truncate text-sm font-medium text-slate-600 dark:text-slate-300">
          {certificate || "\u00A0"}
        </div>

        <div className="mt-2 truncate text-sm font-medium text-slate-600 dark:text-slate-300">
          {languagesLabel || "\u00A0"}
        </div>
      </div>
    </button>
  );
}
