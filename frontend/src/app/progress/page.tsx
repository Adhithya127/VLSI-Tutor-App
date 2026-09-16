"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BookOpen,
  Target,
  Trophy,
  Zap,
  Brain,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  getProgressOverview,
  getLessonProgressList,
  getModules,
  type ProgressOverview,
  type LessonProgressItem,
  type ModuleSummary,
} from "@/lib/api/client";

export default function ProgressPage() {
  const [overview, setOverview] = useState<ProgressOverview | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgressItem[]>(
    []
  );
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProgressOverview().catch(() => null),
      getLessonProgressList().catch(() => []),
      getModules().catch(() => []),
    ])
      .then(([ov, lp, mod]) => {
        setOverview(ov);
        setLessonProgress(lp);
        setModules(mod);
      })
      .finally(() => setLoading(false));
  }, []);

  const completedLessonIds = new Set(
    lessonProgress.filter((p) => p.completed).map((p) => p.lesson_id)
  );

  const statCards = overview
    ? [
        {
          title: "Total XP",
          value: overview.total_xp.toLocaleString(),
          icon: Zap,
          color: "text-yellow-500",
        },
        {
          title: "Lessons Done",
          value: `${overview.completed_lessons} / ${overview.total_lessons}`,
          icon: BookOpen,
          color: "text-blue-500",
        },
        {
          title: "Modules Done",
          value: `${overview.completed_modules} / ${overview.total_modules}`,
          icon: Target,
          color: "text-green-500",
        },
        {
          title: "Accuracy",
          value: overview.total_exercises > 0 ? `${overview.accuracy}%` : "—",
          icon: Trophy,
          color: "text-purple-500",
        },
      ]
    : [];

  return (
    <div className="px-4 lg:px-8 py-6 max-w-6xl">
      <PageHeader
        title="Progress"
        description="Track your learning journey and mastery."
      />

      {overview && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <span className="font-semibold">Level {overview.level}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>
                    {overview.xp_in_level} / 100 XP
                  </span>
                  <span>Level {overview.level + 1}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${overview.xp_in_level}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Curriculum Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : "No modules found."}
            </p>
          ) : (
            <div className="space-y-3">
              {modules.map((mod) => {
                const moduleCompleted = mod.lesson_count > 0;
                return (
                  <div
                    key={mod.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                          moduleCompleted
                            ? "bg-green-100 text-green-700"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {mod.order}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{mod.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {mod.lesson_count} lessons
                        </p>
                      </div>
                    </div>
                    <Link href={`/modules/${mod.id}`}>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Completed Lessons</CardTitle>
        </CardHeader>
        <CardContent>
          {lessonProgress.filter((p) => p.completed).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No lessons completed yet. Start your first lesson!
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
              >
                <Link href="/journey">View Curriculum</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {lessonProgress
                .filter((p) => p.completed)
                .slice(0, 10)
                .map((p) => (
                  <div
                    key={p.lesson_id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Lesson</p>
                        <p className="text-xs text-muted-foreground">
                          Score: {Math.round(p.score * 100)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.completed_at
                        ? new Date(p.completed_at).toLocaleDateString()
                        : ""}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accuracy by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">
                {overview?.total_exercises ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Exercises</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">
                {overview?.correct_exercises ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-muted-foreground">
                {(overview?.total_exercises ?? 0) -
                  (overview?.correct_exercises ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground">Incorrect</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
