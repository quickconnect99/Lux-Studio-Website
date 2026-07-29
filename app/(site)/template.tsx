export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="relative" tabIndex={-1}>
      {children}
    </main>
  );
}
