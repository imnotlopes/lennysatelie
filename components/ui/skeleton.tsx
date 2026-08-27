import { cn } from "@/lib/utils";

export interface SkeletonProps {
  className?: string;
}

/**
 * Placeholder de carregamento. O brilho respeita prefers-reduced-motion
 * pela regra global em globals.css.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-none bg-surface-alt",
        className,
      )}
    />
  );
}

/** Bloco pronto para a grade de produtos: foto 2:3, título e preço. */
export function ProductTileSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="aspect-product w-full" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-2.5 w-1/4" />
    </div>
  );
}
