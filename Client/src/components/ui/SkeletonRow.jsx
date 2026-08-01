// File: src/components/ui/SkeletonRow.jsx

export function SkeletonRow() {
  return (
    <div className="animate-pulse rounded-lg border border-transparent px-3 py-2.5">
      <div className="h-3.5 w-3/4 rounded bg-border" />
      <div className="mt-2 h-3 w-1/3 rounded bg-border/70" />
    </div>
  );
}