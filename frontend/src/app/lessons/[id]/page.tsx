"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { ArrowLeft, Clock, BookOpen, Loader2, CheckCircle2 } from "lucide-react";
import {
  getLesson,
  getModule,
  markLessonComplete,
  getLessonProgress,
  type LessonSummary,
  type ModuleDetail,
} from "@/lib/api/client";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<LessonSummary | null>(null);
  const [module, setModule] = useState<ModuleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!lessonId) return;
    Promise.all([
      getLesson(lessonId),
      getLessonProgress(lessonId).catch(() => null),
    ])
      .then(([l, prog]) => {
        setLesson(l);
        setCompleted(prog?.completed ?? false);
        return getModule(l.module_id);
      })
      .then(setModule)
      .catch(() => setError("Could not load lesson."))
      .finally(() => setLoading(false));
  }, [lessonId]);

  async function handleMarkComplete() {
    if (!lessonId || marking) return;
    setMarking(true);
    try {
      await markLessonComplete(lessonId, 1.0);
      setCompleted(true);
    } catch {
    } finally {
      setMarking(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="px-4 lg:px-8 py-6 max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {error || "Lesson not found."}
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentIndex = module?.lessons.findIndex((l) => l.id === lesson.id) ?? -1;
  const prevLesson = currentIndex > 0 ? module?.lessons[currentIndex - 1] : null;
  const nextLesson =
    module && currentIndex < module.lessons.length - 1
      ? module.lessons[currentIndex + 1]
      : null;

  const paragraphs = (lesson.content || "No content available yet.").split("\n\n");

  return (
    <div className="px-4 lg:px-8 py-6 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/lessons"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lessons
        </Link>
      </div>

      <PageHeader
        title={lesson.title}
        description={module?.title ?? ""}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {lesson.duration_minutes} min
            </div>
            {!completed ? (
              <Button
                size="sm"
                onClick={handleMarkComplete}
                disabled={marking}
              >
                {marking ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                )}
                Mark Complete
              </Button>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm text-green-600 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Completed
              </span>
            )}
          </div>
        }
      />

      <article className="prose prose-neutral dark:prose-invert max-w-none">
        {paragraphs.map((p, i) => {
          const trimmed = p.trim();
          if (!trimmed) return null;

          if (trimmed.startsWith("# ")) {
            return (
              <h1 key={i} className="text-3xl font-bold mt-8 mb-4">
                {trimmed.slice(2)}
              </h1>
            );
          }
          if (trimmed.startsWith("## ")) {
            return (
              <h2 key={i} className="text-2xl font-semibold mt-6 mb-3">
                {trimmed.slice(3)}
              </h2>
            );
          }
          if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
            return (
              <p key={i} className="text-lg font-semibold my-4">
                {trimmed.slice(2, -2)}
              </p>
            );
          }
          if (trimmed.startsWith("- ")) {
            const items = trimmed.split("\n").filter((l) => l.startsWith("- "));
            return (
              <ul key={i} className="list-disc pl-6 space-y-1 my-3">
                {items.map((item, j) => (
                  <li key={j} className="text-muted-foreground">
                    {item.slice(2)}
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p key={i} className="text-muted-foreground my-3 leading-7">
              {trimmed}
            </p>
          );
        })}
      </article>

      <div className="flex items-center justify-between mt-12 pt-6 border-t border-border">
        {prevLesson ? (
          <Link href={`/lessons/${prevLesson.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              {prevLesson.title}
            </Button>
          </Link>
        ) : (
          <div />
        )}
        {nextLesson ? (
          <Link href={`/lessons/${nextLesson.id}`}>
            <Button size="sm">
              {nextLesson.title}
              <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
            </Button>
          </Link>
        ) : (
          <Link href="/lessons">
            <Button size="sm">
              <BookOpen className="h-4 w-4 mr-1" />
              All Lessons
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
