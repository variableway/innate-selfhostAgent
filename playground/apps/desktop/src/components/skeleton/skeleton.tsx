"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60",
        className
      )}
    />
  );
}

// ── Stat Card Skeleton ──
export function StatCardSkeleton() {
  return (
    <div className="flex items-center gap-3 px-5 py-3 bg-card/50 backdrop-blur-sm border rounded-2xl">
      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
      <div className="space-y-1.5">
        <Skeleton className="w-12 h-6" />
        <Skeleton className="w-16 h-3" />
      </div>
    </div>
  );
}

// ── Series Card Skeleton ──
export function SeriesCardSkeleton() {
  return (
    <div className="border rounded-xl p-4 bg-card space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-16 h-5 rounded-full" />
          <Skeleton className="w-full h-5" />
        </div>
      </div>
      <Skeleton className="w-full h-10" />
      <div className="flex items-center gap-4">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-20 h-4" />
      </div>
    </div>
  );
}

// ── Tutorial Card Skeleton ──
export function TutorialCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 bg-card space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="w-14 h-5 rounded-full" />
          <Skeleton className="w-full h-5" />
        </div>
        <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
      </div>
      <Skeleton className="w-full h-8" />
      <div className="flex items-center justify-between">
        <Skeleton className="w-16 h-4" />
        <Skeleton className="w-16 h-7 rounded-full" />
      </div>
    </div>
  );
}

// ── Hero Skeleton ──
export function HeroSkeleton() {
  return (
    <div className="relative px-8 pt-20 pb-10 space-y-6">
      <Skeleton className="w-32 h-8 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="w-64 h-12" />
        <Skeleton className="w-96 h-12" />
      </div>
      <Skeleton className="w-[500px] h-6" />
      <div className="flex flex-wrap gap-4 pt-2">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    </div>
  );
}

// ── Tutorial Detail Skeleton ──
export function TutorialDetailSkeleton() {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="border-b px-6 py-5 space-y-3">
        <Skeleton className="w-48 h-4" />
        <div className="flex items-center gap-2">
          <Skeleton className="w-12 h-5 rounded-full" />
          <Skeleton className="w-16 h-4" />
        </div>
        <Skeleton className="w-3/4 h-8" />
        <Skeleton className="w-1/2 h-5" />
      </div>
      <div className="flex-1 px-6 py-8 max-w-3xl space-y-4">
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-4/5 h-6" />
        <div className="py-2">
          <Skeleton className="w-full h-24 rounded-lg" />
        </div>
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-3/5 h-6" />
      </div>
    </div>
  );
}

// ── Series Detail Skeleton ──
export function SeriesDetailSkeleton() {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="px-8 pt-6 pb-4 border-b space-y-4">
        <div className="flex items-start gap-6">
          <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-20 h-5 rounded-full" />
            <Skeleton className="w-64 h-8" />
            <Skeleton className="w-96 h-5" />
          </div>
        </div>
        <Skeleton className="w-full h-20 rounded-lg" />
      </div>
      <div className="px-8 py-6 space-y-3">
        <Skeleton className="w-32 h-7" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-14 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// ── Tutorials List Skeleton ──
export function TutorialsListSkeleton() {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="px-8 py-6 border-b space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1">
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-48 h-4" />
          </div>
        </div>
        <Skeleton className="w-64 h-9 rounded-lg" />
      </div>
      <div className="flex-1 px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <TutorialCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Simple Spinner (fallback for small loaders) ──
export function InlineSpinner({ text = "加载中..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-muted-foreground">{text}</span>
      </div>
    </div>
  );
}
