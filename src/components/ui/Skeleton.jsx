import React from "react";

export function Skeleton({ className = "" }) {
  return <div className={`ent-shimmer rounded ${className}`} />;
}

export function TableSkeleton({ rows = 6, cols = 7 }) {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div
          key={rIdx}
          className="flex items-center gap-4 py-3 px-3 rounded bg-white/60 border border-[#EAE3D6]/60 animate-pulse"
        >
          <div className="w-5 h-5 rounded ent-shimmer shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-3/4 rounded ent-shimmer" />
            <div className="h-2.5 w-1/2 rounded ent-shimmer opacity-70" />
          </div>
          <div className="w-24 h-4 rounded ent-shimmer hidden sm:block shrink-0" />
          <div className="w-16 h-5 rounded ent-shimmer shrink-0" />
          <div className="w-16 h-5 rounded ent-shimmer shrink-0" />
          <div className="w-20 h-4 rounded ent-shimmer hidden md:block shrink-0" />
          <div className="w-16 h-6 rounded ent-shimmer shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          className="ent-card p-4 bg-white border-[#EAE3D6] flex items-center justify-between"
        >
          <div className="space-y-2 flex-1">
            <div className="h-3 w-20 rounded ent-shimmer" />
            <div className="h-6 w-12 rounded ent-shimmer" />
            <div className="h-2 w-28 rounded ent-shimmer opacity-60" />
          </div>
          <div className="w-10 h-10 rounded ent-shimmer shrink-0 ml-3" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="ent-card p-5 bg-white border-[#EAE3D6] space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-4 w-40 rounded ent-shimmer" />
          <div className="h-3 w-60 rounded ent-shimmer opacity-60" />
        </div>
        <div className="h-7 w-24 rounded ent-shimmer" />
      </div>
      <div className="h-56 w-full rounded ent-shimmer opacity-50" />
    </div>
  );
}

export function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {Array.from({ length: 3 }).map((_, cIdx) => (
        <div key={cIdx} className="ent-card p-4 bg-[#FAF8F5] border-[#EAE3D6] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D6]">
            <div className="h-4 w-28 rounded ent-shimmer" />
            <div className="h-4 w-8 rounded ent-shimmer" />
          </div>
          {Array.from({ length: 3 }).map((_, kIdx) => (
            <div key={kIdx} className="p-3.5 bg-white rounded border border-[#EAE3D6] space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-16 rounded ent-shimmer" />
                <div className="h-4 w-12 rounded ent-shimmer" />
              </div>
              <div className="h-3.5 w-3/4 rounded ent-shimmer" />
              <div className="h-2.5 w-full rounded ent-shimmer opacity-60" />
              <div className="pt-2 border-t border-[#FAF8F5] flex justify-between">
                <div className="h-3 w-20 rounded ent-shimmer" />
                <div className="h-5 w-14 rounded ent-shimmer" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
