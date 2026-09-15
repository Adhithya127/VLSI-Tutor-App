"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  {
    title: "Learn",
    items: [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Journey", href: "/journey" },
      { name: "Lessons", href: "/lessons" },
      { name: "Exercises", href: "/exercises" },
    ],
  },
  {
    title: "Practice",
    items: [
      { name: "Simulations", href: "/simulations" },
      { name: "Projects", href: "/projects" },
      { name: "Challenges", href: "/challenges" },
    ],
  },
  {
    title: "Tools",
    items: [
      { name: "Tutor", href: "/tutor" },
      { name: "Voice", href: "/voice" },
      { name: "Knowledge", href: "/knowledge" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r border-border bg-card">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">V</span>
        </div>
        <span className="font-semibold text-lg tracking-tight">VLSI-Tutor</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigation.map((group) => (
          <div key={group.title}>
            <h3 className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <div className="px-3 py-2">
          <p className="text-xs text-muted-foreground">Level 1</p>
          <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-0 bg-primary rounded-full" />
          </div>
        </div>
      </div>
    </aside>
  );
}
