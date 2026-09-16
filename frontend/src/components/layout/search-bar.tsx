"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, X, Loader2 } from "lucide-react";
import { searchContent, type SearchResult } from "@/lib/api/client";

export function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      searchContent(query)
        .then((res) => {
          setResults([...res.modules, ...res.lessons]);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  function handleSelect(item: SearchResult) {
    setOpen(false);
    setQuery("");
    if (item.type === "module") {
      router.push(`/modules/${item.id}`);
    } else {
      router.push(`/lessons/${item.id}`);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground border border-border rounded-md hover:bg-muted transition-colors"
      >
        <SearchIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 text-[10px] bg-muted rounded border border-border">
          Ctrl K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-lg mx-4">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <SearchIcon className="h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search lessons, modules..."
                className="flex-1 bg-transparent text-sm outline-none"
              />
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {query && results.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No results found.
                </p>
              )}
              {!query && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Type to search...
                </p>
              )}
              {results.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-start gap-3 px-3 py-2 rounded-md text-left hover:bg-muted transition-colors"
                >
                  <div className="mt-0.5 text-xs font-medium uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {item.type === "module" ? "Mod" : "Les"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </p>
                    )}
                    {item.subject && (
                      <p className="text-xs text-muted-foreground">
                        {item.subject}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
