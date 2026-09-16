"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, LogOut } from "lucide-react";
import { Sidebar } from "./sidebar";
import { SearchBar } from "./search-bar";
import { useAuth } from "@/lib/auth-context";

export function Header() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <header className="flex items-center justify-between px-4 lg:px-6 h-14 border-b border-border bg-card">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="lg:hidden" />
            }
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <Sidebar />
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">V</span>
          </div>
          <span className="font-semibold text-sm">VLSI-Tutor</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <SearchBar />
        {loading ? (
          <div className="h-8 w-16 animate-pulse bg-muted rounded" />
        ) : user ? (
          <>
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.display_name || user.username}
            </span>
            <Button variant="ghost" size="icon-sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Link href="/signin">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">
                Get Started
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
