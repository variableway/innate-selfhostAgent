"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  const router = useRouter();

  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-1 hover:text-primary transition-colors"
        title="首页"
      >
        <Home size={14} />
      </button>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <ChevronRight size={14} className="text-muted-foreground/50" />
          {item.href ? (
            <button
              onClick={() => router.push(item.href)}
              className="hover:text-primary transition-colors truncate max-w-[200px]"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-foreground truncate max-w-[300px]">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
