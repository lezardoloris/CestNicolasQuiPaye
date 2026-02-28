'use client';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-[#0F0F0F] text-[#F5F5F5] antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
          <h2 className="text-2xl font-bold">
            Quelque chose s&apos;est casse
          </h2>
          <p className="text-[#A3A3A3] max-w-md">
            Une erreur critique est survenue. Veuillez reessayer.
          </p>
          <button
            onClick={reset}
            className="rounded-md bg-[#DC2626] px-4 py-2 text-sm font-medium text-white hover:bg-[#B91C1C] transition-colors"
          >
            Reessayer
          </button>
        </div>
      </body>
    </html>
  );
}
