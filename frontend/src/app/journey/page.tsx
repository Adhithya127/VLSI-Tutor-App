"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Cpu,
  Binary,
  Layers,
  Code,
  CircuitBoard,
  ChevronRight,
  Lock,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react";
import {
  getModules,
  type ModuleSummary,
} from "@/lib/api/client";

const milestoneMeta: Record<
  number,
  { title: string; description: string; icon: typeof Cpu }
> = {
  1: {
    title: "Electronics Foundations",
    description: "Voltage, current, resistance, semiconductor basics, diodes, transistors",
    icon: Cpu,
  },
  2: {
    title: "Digital Logic",
    description: "Boolean algebra, gates, K-maps, combinational and sequential logic",
    icon: Binary,
  },
  3: {
    title: "RTL Design",
    description: "Verilog, SystemVerilog, FSMs, RTL coding, testbenches",
    icon: Code,
  },
  4: {
    title: "CMOS & VLSI",
    description: "CMOS fabrication, transistor sizing, delay, power, scaling",
    icon: CircuitBoard,
  },
  5: {
    title: "ASIC Flow",
    description: "Synthesis, floorplanning, placement, CTS, routing, signoff",
    icon: Layers,
  },
};

export default function JourneyPage() {
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getModules()
      .then(setModules)
      .catch(() => setError("Could not load curriculum. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const grouped = modules.reduce<Record<number, ModuleSummary[]>>((acc, m) => {
    const key = m.milestone_id ?? 0;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const milestoneIds = Object.keys(grouped)
    .map(Number)
    .filter((id) => id > 0)
    .sort((a, b) => a - b);

  const firstMilestoneId = milestoneIds[0] ?? 1;

  return (
    <div className="px-4 lg:px-8 py-6 max-w-6xl">
      <PageHeader
        title="Learning Journey"
        description="Your path from fundamentals to advanced VLSI Physical Design."
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      ) : milestoneIds.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No curriculum modules found. Run the seed script to populate content.
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-6">
            {milestoneIds.map((milestoneId) => {
              const meta = milestoneMeta[milestoneId] ?? {
                title: `Milestone ${milestoneId}`,
                description: "",
                icon: Layers,
              };
              const Icon = meta.icon;
              const milestoneModules = grouped[milestoneId] ?? [];
              const totalLessons = milestoneModules.reduce(
                (sum, m) => sum + m.lesson_count,
                0,
              );
              const isCurrent = milestoneId === firstMilestoneId;
              const status = isCurrent ? "current" : "locked";

              const config = {
                current: {
                  color: "text-primary",
                  bg: "bg-primary/5 border-primary/30",
                  badge: "In Progress",
                  badgeColor: "bg-primary/10 text-primary",
                },
                locked: {
                  color: "text-muted-foreground",
                  bg: "bg-muted/50 border-border",
                  badge: "Locked",
                  badgeColor: "bg-muted text-muted-foreground",
                },
              }[status];

              return (
                <div key={milestoneId} className="relative flex gap-6">
                  <div
                    className={cn(
                      "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-card",
                      config.bg
                    )}
                  >
                    <Icon className={cn("h-5 w-5", config.color)} />
                  </div>

                  <Card
                    className={cn(
                      "flex-1 transition-colors",
                      isCurrent && "border-primary/30",
                      !isCurrent && "opacity-60"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{meta.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {meta.description}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                            config.badgeColor
                          )}
                        >
                          {isCurrent ? (
                            <Circle className="h-3 w-3" />
                          ) : (
                            <Lock className="h-3 w-3" />
                          )}
                          {config.badge}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{milestoneModules.length} modules</span>
                          <span>{totalLessons} lessons</span>
                        </div>
                        {isCurrent ? (
                          <Button variant="ghost" size="sm">
                            Continue
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Lock className="h-3 w-3" />
                            Complete previous milestone
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Card className="mt-10">
        <CardHeader>
          <CardTitle className="text-base">Prerequisite Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6 text-center">
            <div className="space-y-2">
              <Layers className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground max-w-md">
                The knowledge graph shows how concepts connect. As you progress,
                prerequisite relationships unlock new topics automatically.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
