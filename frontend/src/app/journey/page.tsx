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
} from "lucide-react";

const milestones = [
  {
    id: 1,
    title: "Electronics Foundations",
    description: "Voltage, current, resistance, semiconductor basics, diodes, transistors",
    icon: Cpu,
    status: "current" as const,
    modules: 8,
    concepts: 32,
  },
  {
    id: 2,
    title: "Digital Logic",
    description: "Boolean algebra, gates, K-maps, combinational and sequential logic",
    icon: Binary,
    status: "locked" as const,
    modules: 10,
    concepts: 38,
  },
  {
    id: 3,
    title: "RTL Design",
    description: "Verilog, SystemVerilog, FSMs, RTL coding, testbenches",
    icon: Code,
    status: "locked" as const,
    modules: 12,
    concepts: 45,
  },
  {
    id: 4,
    title: "CMOS & VLSI",
    description: "CMOS fabrication, transistor sizing, delay, power, scaling",
    icon: CircuitBoard,
    status: "locked" as const,
    modules: 9,
    concepts: 28,
  },
  {
    id: 5,
    title: "ASIC Flow",
    description: "Synthesis, floorplanning, placement, CTS, routing, signoff",
    icon: Layers,
    status: "locked" as const,
    modules: 14,
    concepts: 52,
  },
];

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-500/10 border-green-500/30",
    badge: "Completed",
    badgeColor: "bg-green-500/10 text-green-600",
  },
  current: {
    icon: Circle,
    color: "text-primary",
    bg: "bg-primary/5 border-primary/30",
    badge: "In Progress",
    badgeColor: "bg-primary/10 text-primary",
  },
  locked: {
    icon: Lock,
    color: "text-muted-foreground",
    bg: "bg-muted/50 border-border",
    badge: "Locked",
    badgeColor: "bg-muted text-muted-foreground",
  },
};

export default function JourneyPage() {
  return (
    <div className="px-4 lg:px-8 py-6 max-w-6xl">
      <PageHeader
        title="Learning Journey"
        description="Your path from fundamentals to advanced VLSI Physical Design."
      />

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-6">
          {milestones.map((milestone) => {
            const config = statusConfig[milestone.status];
            const Icon = milestone.icon;
            const StatusIcon = config.icon;

            return (
              <div key={milestone.id} className="relative flex gap-6">
                <div className={cn(
                  "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-card",
                  config.bg
                )}>
                  <Icon className={cn("h-5 w-5", config.color)} />
                </div>

                <Card className={cn(
                  "flex-1 transition-colors",
                  milestone.status === "current" && "border-primary/30",
                  milestone.status === "locked" && "opacity-60"
                )}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{milestone.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {milestone.description}
                        </p>
                      </div>
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                        config.badgeColor
                      )}>
                        <StatusIcon className="h-3 w-3" />
                        {config.badge}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{milestone.modules} modules</span>
                        <span>{milestone.concepts} concepts</span>
                      </div>
                      {milestone.status !== "locked" ? (
                        <Button variant="ghost" size="sm">
                          {milestone.status === "current" ? "Continue" : "Review"}
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
