"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, ArrowRight, Filter, Loader2 } from "lucide-react";
import {
  getModules,
  getModule,
  type ModuleSummary,
  type ModuleDetail,
} from "@/lib/api/client";

export default function LessonsPage() {
  const [modules, setModules] = useState<ModuleSummary[]>([]);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [moduleDetails, setModuleDetails] = useState<
    Record<string, ModuleDetail>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getModules()
      .then(setModules)
      .catch(() => setError("Could not load lessons. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  async function toggleModule(moduleId: string) {
    if (expandedModule === moduleId) {
      setExpandedModule(null);
      return;
    }
    setExpandedModule(moduleId);
    if (!moduleDetails[moduleId]) {
      try {
        const detail = await getModule(moduleId);
        setModuleDetails((prev) => ({ ...prev, [moduleId]: detail }));
      } catch {
        // ignore
      }
    }
  }

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
              <div className="space-y-3">
                {grouped[subject].map((mod) => {
                  const isExpanded = expandedModule === mod.id;
                  const detail = moduleDetails[mod.id];

                  return (
                    <Card key={mod.id}>
                      <CardContent className="p-0">
                        <button
                          onClick={() => toggleModule(mod.id)}
                          className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="flex items-start gap-3">
                            <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                            <div className="space-y-1">
                              <h3 className="font-medium text-sm">
                                {mod.title}
                              </h3>
                              {mod.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {mod.description}
                                </p>
                              )}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {mod.lesson_count} lessons
                              </div>
                            </div>
                          </div>
                          <ArrowRight
                            className={`h-4 w-4 text-muted-foreground transition-transform ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          />
                        </button>

                        {isExpanded && detail && (
                          <div className="border-t border-border">
                            {detail.lessons
                              .sort((a, b) => a.order - b.order)
                              .map((lesson) => (
                                <Link
                                  key={lesson.id}
                                  href={`/lessons/${lesson.id}`}
                                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                      {lesson.order}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">
                                        {lesson.title}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {lesson.duration_minutes} min
                                      </p>
                                    </div>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </Link>
                              ))}
                          </div>
                        )}

                        {isExpanded && !detail && (
                          <div className="border-t border-border p-4">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
