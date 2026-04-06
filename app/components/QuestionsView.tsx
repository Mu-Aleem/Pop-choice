"use client";

import { useState } from "react";

const MOODS = ["Fun", "Serious", "Inspiring", "Scary"];
const ERA_OPTIONS = ["New", "Classic"];

export interface PersonAnswers {
  favoriteMovie: string;
  whyFavorite: string;
  era: string;
  mood: string;
  favoritePerson: string;
  whyPerson: string;
}

interface QuestionsViewProps {
  personIndex: number;
  totalPeople: number;
  onSubmit: (answers: PersonAnswers) => void;
}

export default function QuestionsView({
  personIndex,
  totalPeople,
  onSubmit,
}: QuestionsViewProps) {
  const [answers, setAnswers] = useState<PersonAnswers>({
    favoriteMovie: "",
    whyFavorite: "",
    era: "",
    mood: "",
    favoritePerson: "",
    whyPerson: "",
  });

  const isLast = personIndex === totalPeople - 1;
  const canSubmit = answers.favoriteMovie && answers.era && answers.mood;

  function update(field: keyof PersonAnswers, value: string) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Person indicator */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-5xl">🍿</span>
        <span className="text-4xl font-bold text-accent-green">
          {personIndex + 1}
        </span>
      </div>

      {/* Q1: Favorite movie */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text-secondary">
          What&apos;s your favorite movie and why?
        </label>
        <textarea
          placeholder="The Shawshank Redemption — Because it taught me to never give up hope no matter how hard life gets."
          value={answers.favoriteMovie}
          onChange={(e) => update("favoriteMovie", e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-bg-input border border-slate-600 text-text-primary text-sm leading-relaxed placeholder:text-text-muted focus:outline-none focus:border-accent-green resize-none transition-colors"
        />
      </div>

      {/* Q2: New or Classic */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-text-secondary">
          Are you in the mood for something new or a classic?
        </label>
        <div className="flex gap-3">
          {ERA_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => update("era", option)}
              className={`chip ${answers.era === option ? "selected" : ""}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Q3: Mood */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-text-secondary">
          What are you in the mood for?
        </label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m}
              onClick={() => update("mood", m)}
              className={`chip ${answers.mood === m ? "selected" : ""}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Q4: Favorite film person */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text-secondary">
          Which famous film person would you love to be stranded on an island
          with and why?
        </label>
        <textarea
          placeholder="Tom Hanks because he is really funny and can do the voice of Woody"
          value={answers.favoritePerson}
          onChange={(e) => update("favoritePerson", e.target.value)}
          rows={2}
          className="w-full px-4 py-3 rounded-xl bg-bg-input border border-slate-600 text-text-primary text-sm leading-relaxed placeholder:text-text-muted focus:outline-none focus:border-accent-green resize-none transition-colors"
        />
      </div>

      {/* Submit */}
      <button
        onClick={() => canSubmit && onSubmit(answers)}
        disabled={!canSubmit}
        className="w-full py-4 rounded-xl font-semibold text-lg transition-all bg-accent-green text-slate-900 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLast ? "Get Movie" : "Next Person"}
      </button>
    </div>
  );
}
