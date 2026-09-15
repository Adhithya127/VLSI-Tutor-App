import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { BookOpen } from "lucide-react";

export default function KnowledgePage() {
  return (
    <div className="px-4 lg:px-8 py-6 max-w-6xl">
      <PageHeader
        title="Knowledge Base"
        description="Browse VLSI reference materials and documentation."
      />
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Coming Soon</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Structured VLSI knowledge base with textbooks, documentation,
              research papers, and curated reference materials.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
