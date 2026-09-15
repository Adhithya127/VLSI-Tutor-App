"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Mic, BookOpen, Lightbulb, HelpCircle } from "lucide-react";

const suggestions = [
  {
    icon: BookOpen,
    text: "Explain how a CMOS inverter works",
  },
  {
    icon: Lightbulb,
    text: "What is setup time violation?",
  },
  {
    icon: HelpCircle,
    text: "Walk me through the ASIC flow",
  },
];

export default function TutorPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">AI Tutor</h1>
            <p className="text-muted-foreground max-w-md">
              Ask anything about VLSI, digital design, physical design, or
              semiconductor engineering. The tutor adapts to your level.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {suggestions.map((suggestion) => (
              <Card
                key={suggestion.text}
                className="cursor-pointer hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <suggestion.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">{suggestion.text}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-card px-4 lg:px-8 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                placeholder="Ask the tutor a question..."
                className="w-full min-h-[44px] max-h-32 resize-none rounded-lg border border-border bg-background px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                rows={1}
              />
            </div>
            <Button size="icon" disabled>
              <Send className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" disabled>
              <Mic className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            AI responses are generated. Always verify technical information.
          </p>
        </div>
      </div>
    </div>
  );
}
