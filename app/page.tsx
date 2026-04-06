"use client";

import { useState } from "react";
import StartView from "./components/StartView";
import QuestionsView, { type PersonAnswers } from "./components/QuestionsView";
import MovieView from "./components/MovieView";

type Step = "start" | "questions" | "result";

interface MovieResult {
  title: string;
  year: string;
  reason: string;
  description: string;
  posterUrl: string | null;
}

export default function Home() {
  const [step, setStep] = useState<Step>("start");
  const [peopleCount, setPeopleCount] = useState("");
  const [timeAvailable, setTimeAvailable] = useState("");
  const [currentPerson, setCurrentPerson] = useState(0);
  const [allAnswers, setAllAnswers] = useState<PersonAnswers[]>([]);
  const [movie, setMovie] = useState<MovieResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [previousTitles, setPreviousTitles] = useState<string[]>([]);

  function handleStart() {
    const count = parseInt(peopleCount);
    if (!count || count < 1 || !timeAvailable) return;
    setStep("questions");
    setCurrentPerson(0);
    setAllAnswers([]);
  }

  async function fetchRecommendation(
    answers: PersonAnswers[],
    prevTitles: string[]
  ) {
    setLoading(true);
    setStep("result");
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          allAnswers: answers,
          timeAvailable,
          previousTitles: prevTitles,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMovie(data);
      setPreviousTitles((prev) => [...prev, data.title]);
    } catch (err) {
      console.error("Failed to get recommendation:", err);
      setMovie({
        title: "Error",
        year: "",
        reason: "Something went wrong. Please try again.",
        description: "",
        posterUrl: null,
      });
    } finally {
      setLoading(false);
    }
  }

  function handlePersonSubmit(answers: PersonAnswers) {
    const updated = [...allAnswers, answers];
    setAllAnswers(updated);
    const total = parseInt(peopleCount);
    if (currentPerson + 1 < total) {
      setCurrentPerson(currentPerson + 1);
    } else {
      fetchRecommendation(updated, previousTitles);
    }
  }

  function handleNextMovie() {
    fetchRecommendation(allAnswers, previousTitles);
  }

  function handleStartOver() {
    setStep("start");
    setPeopleCount("");
    setTimeAvailable("");
    setCurrentPerson(0);
    setAllAnswers([]);
    setMovie(null);
    setPreviousTitles([]);
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4 py-8">
      <div className="w-full max-w-100 bg-bg-card rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8">
          {step === "start" && (
            <StartView
              peopleCount={peopleCount}
              timeAvailable={timeAvailable}
              onPeopleCountChange={setPeopleCount}
              onTimeChange={setTimeAvailable}
              onStart={handleStart}
            />
          )}

          {step === "questions" && (
            <QuestionsView
              personIndex={currentPerson}
              totalPeople={parseInt(peopleCount) || 1}
              onSubmit={handlePersonSubmit}
            />
          )}

          {step === "result" && (
            <MovieView
              title={movie?.title ?? ""}
              year={movie?.year ?? ""}
              description={movie?.description ?? ""}
              posterUrl={movie?.posterUrl ?? null}
              reason={movie?.reason ?? ""}
              loading={loading}
              onNextMovie={handleNextMovie}
            />
          )}

          {step !== "start" && (
            <button
              onClick={handleStartOver}
              className="mt-6 w-full text-sm text-text-muted hover:text-text-secondary transition-colors text-center"
            >
              Start Over
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
