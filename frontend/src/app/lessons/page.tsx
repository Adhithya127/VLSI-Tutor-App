"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, ArrowRight, Filter, Loader2 } from "lucide-react";
import { getModules, type ModuleSummary } from "@/lib/api/client";

export default function LessonsPage() {
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getModules()
      .then(setModules)
      .catch(() => setError("Could not load lessons. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const grouped = modules.reduce<Record<string, ModuleSummary[]>>((acc, m) => {
    if (!acc[m.subject]) acc[m.subject] = [];
    acc[m.subject].push(m);
    return acc;
  }, {});

  const subjects = Object.keys(grouped).sort();

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
      ) : subjects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No lessons found. Run the seed script to populate content.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {subjects.map((subject) => (
            <div key={subject}>
              <h2 className="text-lg font-semibold mb-4">{subject}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {grouped[subject].map((mod) => (
                  <Card
                    key={mod.id}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-medium text-sm">{mod.title}</h3>
                            {mod.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {mod.description}
                              </p>
                            )}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {mod.lesson_count} lessons
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon-sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
