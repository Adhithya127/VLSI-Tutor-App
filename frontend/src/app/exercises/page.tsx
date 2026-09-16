"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  getModules,
  getExercisesForLesson,
  submitExercise,
  type ModuleSummary,
  type LessonSummary,
  type Exercise,
  type ExerciseResult,
} from "@/lib/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import {
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  FileQuestion,
  Loader2,
} from "lucide-react";

type QuizState = "selecting" | "quiz" | "results";

interface QuizResult {
  exercise: Exercise;
  result: ExerciseResult;
  userAnswer: string;
}

export default function ExercisesPage() {
  const { user } = useAuth();
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<LessonSummary | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [quizState, setQuizState] = useState<QuizState>("selecting");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [currentResult, setCurrentResult] = useState<ExerciseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    if (user) loadModules();
  }, [user]);

  async function loadModules() {
    setLoading(true);
    try {
      const mods = await getModules();
      setModules(mods);
    } catch {
      // ignore
    }
    setLoading(false);
  }

  const handleStartQuiz = useCallback(async (lesson: LessonSummary) => {
    setSelectedLesson(lesson);
    setLoading(true);
    try {
      const exs = await getExercisesForLesson(lesson.id);
      if (exs.length === 0) {
        alert("No exercises available for this lesson yet.");
        setLoading(false);
        return;
      }
      setExercises(exs);
      setCurrentIndex(0);
      setQuizResults([]);
      setSelectedAnswer(null);
      setShowResult(false);
      setCurrentResult(null);
      setStartTime(Date.now());
      setQuizState("quiz");
    } catch {
      alert("Failed to load exercises.");
    }
    setLoading(false);
  }, []);

  async function handleSubmitAnswer() {
    if (!selectedAnswer || !exercises[currentIndex]) return;

    const exercise = exercises[currentIndex];
    const timeSeconds = (Date.now() - startTime) / 1000;

    try {
      const result = await submitExercise(exercise.id, selectedAnswer, timeSeconds);
      setCurrentResult(result);
      setQuizResults((prev) => [
        ...prev,
        { exercise, result, userAnswer: selectedAnswer },
      ]);
      setShowResult(true);
    } catch {
      alert("Failed to submit answer.");
    }
  }

  function handleNextQuestion() {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setCurrentResult(null);
      setStartTime(Date.now());
    } else {
      setQuizState("results");
    }
  }

  function handleRetryQuiz() {
    if (selectedLesson) {
      handleStartQuiz(selectedLesson);
    }
  }

  function parseOptions(options: string | null): string[] {
    if (!options) return [];
    try {
      return JSON.parse(options);
    } catch {
      return [];
    }
  }

  const correctCount = quizResults.filter((r) => r.result.is_correct).length;
  const totalXp = quizResults.reduce((sum, r) => sum + r.result.xp_earned, 0);

  if (!user) {
    return (
      <div className="px-4 lg:px-8 py-6 max-w-6xl">
        <PageHeader title="Exercises" description="Sign in to access exercises." />
        <Card>
          <CardContent className="p-12 text-center">
            <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Please sign in to start exercises.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizState === "results") {
    return (
      <div className="px-4 lg:px-8 py-6 max-w-3xl">
        <PageHeader
          title="Quiz Complete"
          description={`Results for ${selectedLesson?.title || "quiz"}`}
        />
        <Card className="mb-6">
          <CardContent className="p-8 text-center">
            <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">
              {correctCount}/{exercises.length}
            </h2>
            <p className="text-muted-foreground mb-4">
              {correctCount === exercises.length
                ? "Perfect score!"
                : correctCount > exercises.length / 2
                  ? "Good job!"
                  : "Keep practicing!"}
            </p>
            <p className="text-lg font-semibold text-primary mb-6">
              +{totalXp} XP earned
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleRetryQuiz} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry Quiz
              </Button>
              <Button onClick={() => setQuizState("selecting")}>
                Choose Another Lesson
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {quizResults.map((qr, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {qr.result.is_correct ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{qr.exercise.question}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your answer: <span className={qr.result.is_correct ? "text-green-600" : "text-red-600"}>{qr.userAnswer}</span>
                      {!qr.result.is_correct && qr.result.correct_answer && (
                        <> — Correct: <span className="text-green-600">{qr.result.correct_answer}</span></>
                      )}
                    </p>
                    {qr.result.explanation && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{qr.result.explanation}</p>
                    )}
                  </div>
                  <span className="text-xs font-medium text-primary">+{qr.result.xp_earned} XP</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (quizState === "quiz" && exercises.length > 0) {
    const exercise = exercises[currentIndex];
    const options = parseOptions(exercise.options);

    return (
      <div className="px-4 lg:px-8 py-6 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => setQuizState("selecting")}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
              <span>{selectedLesson?.title}</span>
              <span>{currentIndex + 1} / {exercises.length}</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
                Difficulty {exercise.difficulty}
              </span>
              <span className="text-xs text-muted-foreground">
                +{exercise.xp_reward} XP
              </span>
            </div>
            <h2 className="text-lg font-semibold mb-6">{exercise.question}</h2>

            <div className="space-y-3">
              {options.map((option, i) => {
                const letter = String.fromCharCode(65 + i);
                const isSelected = selectedAnswer === option;
                const isCorrect = showResult && option === exercise.correct_answer;
                const isWrong = showResult && isSelected && !exercise.result?.is_correct;

                return (
                  <button
                    key={i}
                    onClick={() => !showResult && setSelectedAnswer(option)}
                    disabled={showResult}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      isCorrect
                        ? "border-green-500 bg-green-50 dark:bg-green-950"
                        : isSelected && showResult
                          ? "border-red-500 bg-red-50 dark:bg-red-950"
                          : isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full border flex items-center justify-center text-sm font-medium shrink-0">
                        {isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : isSelected && showResult ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          letter
                        )}
                      </span>
                      <span className="text-sm">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {showResult && currentResult && (
              <div className={`mt-6 p-4 rounded-lg ${currentResult.is_correct ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {currentResult.is_correct ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    {currentResult.is_correct ? "Correct!" : "Incorrect"}
                  </span>
                  {currentResult.xp_earned > 0 && (
                    <span className="text-sm text-primary">+{currentResult.xp_earned} XP</span>
                  )}
                </div>
                {currentResult.explanation && (
                  <p className="text-sm text-muted-foreground">{currentResult.explanation}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          {showResult ? (
            <Button onClick={handleNextQuestion}>
              {currentIndex < exercises.length - 1 ? "Next Question" : "See Results"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer}>
              Submit Answer
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-8 py-6 max-w-6xl">
      <PageHeader
        title="Exercises"
        description="Practice problems to reinforce your understanding."
      />

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading exercises...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {modules.map((mod) => (
            <div key={mod.id}>
              <h2 className="text-lg font-semibold mb-3">{mod.title}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {mod.lessons && mod.lessons.length > 0
                  ? mod.lessons.map((lesson) => (
                      <Card
                        key={lesson.id}
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => handleStartQuiz(lesson)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{lesson.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {lesson.duration_minutes} min
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  : (
                    <Card className="opacity-60">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">No lessons available</p>
                      </CardContent>
                    </Card>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
