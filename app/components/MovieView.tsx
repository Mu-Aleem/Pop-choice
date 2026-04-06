"use client";

interface MovieViewProps {
  title: string;
  year: string;
  description: string;
  posterUrl: string | null;
  reason: string;
  loading: boolean;
  onNextMovie: () => void;
}

export default function MovieView({
  title,
  year,
  description,
  posterUrl,
  reason,
  loading,
  onNextMovie,
}: MovieViewProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center gap-5 animate-pulse">
        <div className="w-48 h-6 rounded-lg bg-bg-input" />
        <div className="w-full h-72 rounded-2xl bg-bg-input" />
        <div className="w-full space-y-2">
          <div className="w-full h-4 rounded bg-bg-input" />
          <div className="w-3/4 h-4 rounded bg-bg-input" />
          <div className="w-5/6 h-4 rounded bg-bg-input" />
        </div>
        <div className="w-full h-14 rounded-xl bg-bg-input" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Movie Title + Year */}
      <h2 className="text-2xl font-bold text-text-primary text-center">
        {title} ({year})
      </h2>

      {/* Poster */}
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={`${title} poster`}
          className="w-full rounded-2xl shadow-lg object-cover"
        />
      ) : (
        <div className="w-full h-72 rounded-2xl bg-bg-input flex items-center justify-center text-text-muted text-sm">
          No poster available
        </div>
      )}

      {/* Description / Reason */}
      <p className="text-sm text-text-secondary leading-relaxed text-center">
        {reason || description}
      </p>

      {/* Next Movie */}
      <button
        onClick={onNextMovie}
        className="w-full py-4 rounded-xl font-semibold text-lg transition-all bg-accent-green text-slate-900 hover:brightness-110"
      >
        Next Movie
      </button>
    </div>
  );
}
