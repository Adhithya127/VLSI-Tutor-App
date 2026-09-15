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
  Flame,
} from "lucide-react";

const stats = [
  {
    title: "XP Earned",
    value: "0",
    icon: Zap,
    color: "text-yellow-500",
  },
  {
    title: "Concepts Mastered",
    value: "0 / 248",
    icon: Target,
    color: "text-green-500",
  },
  {
    title: "Current Streak",
    value: "0 days",
    icon: Flame,
    color: "text-orange-500",
  },
  {
    title: "Lessons Completed",
    value: "0",
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

export default function DashboardPage() {
  return (
    <div className="px-4 lg:px-8 py-6 max-w-6xl">
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's your learning overview."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {quickActions.map((action) => (
          <Card key={action.title} className="group cursor-pointer hover:border-primary/50 transition-colors">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No activity yet. Start your first lesson to begin tracking progress.
            </p>
            <Button render={<Link href="/journey" />} variant="outline" size="sm" className="mt-4">
              View Curriculum
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
