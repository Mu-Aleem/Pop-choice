"use client";

interface StartViewProps {
  peopleCount: string;
  timeAvailable: string;
  onPeopleCountChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onStart: () => void;
}

export default function StartView({
  peopleCount,
  timeAvailable,
  onPeopleCountChange,
  onTimeChange,
  onStart,
}: StartViewProps) {
  const isValid = peopleCount && timeAvailable;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <span className="text-6xl">🍿</span>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          PopChoice
        </h1>
      </div>

      {/* Inputs */}
      <div className="flex flex-col gap-4 w-full">
        <input
          type="number"
          min="1"
          max="20"
          placeholder="How many people?"
          value={peopleCount}
          onChange={(e) => onPeopleCountChange(e.target.value)}
          className="w-full px-5 py-4 rounded-xl bg-bg-input border border-slate-600 text-text-primary placeholder:text-text-muted text-base focus:outline-none focus:border-accent-green transition-colors"
        />
        <input
          type="text"
          placeholder="How much time do you have?"
          value={timeAvailable}
          onChange={(e) => onTimeChange(e.target.value)}
          className="w-full px-5 py-4 rounded-xl bg-bg-input border border-slate-600 text-text-primary placeholder:text-text-muted text-base focus:outline-none focus:border-accent-green transition-colors"
        />
      </div>

      {/* Start Button */}
      <button
        onClick={onStart}
        disabled={!isValid}
        className="w-full py-4 rounded-xl font-semibold text-lg transition-all bg-accent-green text-slate-900 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Start
      </button>
    </div>
  );
}
