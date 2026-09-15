import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  FileQuestion,
  Code,
  Cpu,
  BarChart3,
  ArrowRight,
  Filter,
  Lock,
} from "lucide-react";

const exerciseTypes = [
  {
    icon: FileQuestion,
    title: "Conceptual Questions",
    description: "Test understanding of VLSI concepts and theory",
    count: 0,
    available: false,
  },
  {
    icon: Code,
    title: "RTL Problems",
    description: "Write and debug Verilog/SystemVerilog code",
    count: 0,
    available: false,
  },
  {
    icon: Cpu,
    title: "Circuit Analysis",
    description: "Analyze CMOS circuits, timing, and power",
    count: 0,
    available: false,
  },
  {
    icon: BarChart3,
    title: "STA Problems",
    description: "Setup/hold analysis, timing reports, violations",
    count: 0,
    available: false,
  },
];

export default function ExercisesPage() {
  return (
    <div className="px-4 lg:px-8 py-6 max-w-6xl">
      <PageHeader
        title="Exercises"
        description="Practice problems to reinforce your understanding."
        actions={
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {exerciseTypes.map((type) => (
          <Card
            key={type.title}
            className={
              type.available
                ? "cursor-pointer hover:border-primary/50 transition-colors"
                : "opacity-60"
            }
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <type.icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{type.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {type.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {type.count} exercises available
                  </p>
                </div>
                {type.available ? (
                  <Button variant="ghost" size="icon-sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <FileQuestion className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground max-w-md">
              Exercises unlock as you progress through lessons. Complete your
              first lesson to start practicing.
            </p>
            <Button variant="outline" size="sm" className="mt-4">
              Start First Lesson
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
