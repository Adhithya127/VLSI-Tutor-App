import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, ArrowRight, Filter } from "lucide-react";

const categories = [
  {
    name: "Electronics Foundations",
    lessons: [
      { title: "Voltage, Current & Resistance", duration: "15 min", status: "available" as const },
      { title: "Semiconductor Physics", duration: "20 min", status: "available" as const },
      { title: "Diode Operation", duration: "18 min", status: "locked" as const },
      { title: "MOSFET Fundamentals", duration: "25 min", status: "locked" as const },
    ],
  },
  {
    name: "Digital Logic",
    lessons: [
      { title: "Number Systems", duration: "12 min", status: "locked" as const },
      { title: "Boolean Algebra", duration: "20 min", status: "locked" as const },
      { title: "Logic Gates", duration: "15 min", status: "locked" as const },
      { title: "Karnaugh Maps", duration: "22 min", status: "locked" as const },
    ],
  },
  {
    name: "RTL Design",
    lessons: [
      { title: "Introduction to Verilog", duration: "30 min", status: "locked" as const },
      { title: "Combinational Logic in Verilog", duration: "25 min", status: "locked" as const },
      { title: "Sequential Logic & Flip-Flops", duration: "28 min", status: "locked" as const },
      { title: "Finite State Machines", duration: "35 min", status: "locked" as const },
    ],
  },
];

export default function LessonsPage() {
  return (
    <div className="px-4 lg:px-8 py-6 max-w-6xl">
      <PageHeader
        title="Lessons"
        description="Structured lessons from fundamentals to advanced topics."
        actions={
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        }
      />

      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category.name}>
            <h2 className="text-lg font-semibold mb-4">{category.name}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {category.lessons.map((lesson) => (
                <Card
                  key={lesson.title}
                  className={
                    lesson.status === "locked"
                      ? "opacity-60"
                      : "cursor-pointer hover:border-primary/50 transition-colors"
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <BookOpen
                            className={`h-5 w-5 ${
                              lesson.status === "locked"
                                ? "text-muted-foreground"
                                : "text-primary"
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium text-sm">{lesson.title}</h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {lesson.duration}
                          </div>
                        </div>
                      </div>
                      {lesson.status !== "locked" && (
                        <Button variant="ghost" size="icon-sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
