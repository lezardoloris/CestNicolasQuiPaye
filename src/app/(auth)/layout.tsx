import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center px-4 py-4 md:min-h-[calc(100vh-2rem)] md:py-12">
      <Link
        href="/feed/hot"
        className="mb-4 font-display text-3xl font-bold text-chainsaw-red md:mb-8"
      >
        C'est Nicolas Qui Paie
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
