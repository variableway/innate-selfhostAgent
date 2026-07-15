"use client";

import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TutorialTocProps {
  headings: Heading[];
}

export function TutorialToc({ headings }: TutorialTocProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-100px 0px -60% 0px",
        threshold: 0,
      }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        目录
      </p>
      <ul className="space-y-1 border-l border-border/60">
        {headings.map((h) => (
          <li key={h.id}>
            <button
              onClick={() => handleClick(h.id)}
              className={`block text-left w-full pl-3 py-1 text-sm transition-colors hover:text-primary ${
                h.level === 3 ? "pl-6" : ""
              } ${
                activeId === h.id
                  ? "text-primary font-medium border-l-2 border-primary -ml-[2px] bg-primary/5"
                  : "text-muted-foreground"
              }`}
            >
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
