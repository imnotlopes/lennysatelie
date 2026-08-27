import { Container, Skeleton } from "@/components/ui";

/** Esqueleto da home, seção por seção. */
export default function Loading() {
  return (
    <main className="flex flex-col">
      <Skeleton className="h-[100svh] min-h-125 w-full" />

      <Container className="flex flex-col gap-6 py-12">
        <Skeleton className="h-7 w-64" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-3/4 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </Container>

      <Container className="flex flex-col gap-6 py-12">
        <Skeleton className="h-7 w-72" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex w-2/3 shrink-0 flex-col gap-2 lg:w-1/4">
              <Skeleton className="aspect-product w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2.5 w-1/3" />
            </div>
          ))}
        </div>
      </Container>

      <div className="bg-surface-alt">
        <Container className="flex flex-col gap-8 py-12">
          <Skeleton className="h-7 w-80" />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </Container>
      </div>

      <Container className="flex flex-col gap-6 py-12">
        <Skeleton className="h-7 w-48" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-44 w-4/5 shrink-0 lg:w-1/3" />
          ))}
        </div>
      </Container>

      <div className="bg-surface-alt">
        <Container className="flex flex-col items-center gap-4 py-12">
          <Skeleton className="h-7 w-80" />
          <Skeleton className="h-10 w-48" />
        </Container>
      </div>
    </main>
  );
}
