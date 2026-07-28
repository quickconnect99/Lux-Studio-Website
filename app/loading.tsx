export default function Loading() {
  return (
    <main
      className="section-shell min-h-[65dvh] py-16"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="animate-pulse space-y-8">
        <div className="h-4 w-32 rounded-full bg-panel-secondary" />
        <div className="h-20 max-w-2xl rounded-[1.5rem] bg-panel-secondary sm:h-32" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="aspect-[4/3] rounded-[1.5rem] border border-line bg-panel-secondary sm:aspect-[4/5]"
            />
          ))}
        </div>
      </div>
      <p className="sr-only">Loading content…</p>
    </main>
  );
}
