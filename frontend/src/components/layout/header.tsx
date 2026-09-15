"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";

export function Header() {
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

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          Sign In
        </Button>
        <Button size="sm">Get Started</Button>
      </div>
    </header>
  );
}
