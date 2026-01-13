"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { ChevronLeftIcon } from "@/components/ui/icons";

interface HeaderProps {
  title: string;
  backHref?: string;
  rightAction?: ReactNode;
}

export function Header({ title, backHref, rightAction }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2 min-w-0">
          {backHref && (
            <Link
              href={backHref}
              className="p-1 -ml-1 text-muted hover:text-foreground transition-colors"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </Link>
          )}
          <h1 className="text-lg font-semibold truncate">{title}</h1>
        </div>
        {rightAction && <div className="flex-shrink-0">{rightAction}</div>}
      </div>
    </header>
  );
}
