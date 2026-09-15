"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BookOpen,
  Cpu,
  Zap,
  Target,
  ArrowRight,
  Clock,
  Trophy,
  Brain,
  RefreshCw,
} from "lucide-react";
import { getDashboardStats, type DashboardStats } from "@/lib/api/client";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      title: "XP Earned",
      value: stats?.xp.toLocaleString() ?? "—",
      icon: Zap,
      color: "text-yellow-500",
    },
    {
      title: "Concepts Mastered",
      value: stats
        ? `${stats.concepts_mastered} / ${stats.total_concepts}`
        : "—",
      icon: Target,
      color: "text-green-500",
    },
    {
      title: "Pending Reviews",
      value: stats?.pending_reviews.toString() ?? "—",
      icon: RefreshCw,
      color: "text-purple-500",
    },
    {
      title: "Exercises Done",
      value: stats?.total_attempts.toString() ?? "—",
      icon: Trophy,
      color: "text-blue-500",
    },
  ];

  const quickActions = [
    {
      title: "Continue Learning",
      description: "Pick up where you left off",
      icon: BookOpen,
      href: "/journey",
    },
    {
      title: "AI Tutor",
      description: "Ask a VLSI question",
      icon: Cpu,
      href: "/tutor",
    },
    {
      title: "Daily Challenge",
      description: "Test your skills",
      icon: Zap,
      href: "/challenges",
    },
  ];

  return (
    <div className="px-4 lg:px-8 py-6 max-w-6xl">
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's your learning overview."
      />

      {stats && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <span className="font-semibold">Level {stats.level}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{stats.xp_in_level} / 100 XP</span>
                  <span>Level {stats.level + 1}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${stats.xp_in_level}%` }}
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {quickActions.map((action) => (
          <Card
            key={action.title}
            className="group cursor-pointer hover:border-primary/50 transition-colors"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <action.icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{action.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats && stats.total_attempts > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{stats.total_attempts}</p>
                <p className="text-xs text-muted-foreground">Total Attempts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {stats.correct_attempts}
                </p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">
                  {stats.total_attempts - stats.correct_attempts}
                </p>
                <p className="text-xs text-muted-foreground">Incorrect</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {stats && stats.total_attempts > 0
                ? "Your recent activity will appear here."
                : "No activity yet. Start your first lesson to begin tracking progress."}
            </p>
            <Button
              render={<Link href="/journey" />}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              View Curriculum
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
