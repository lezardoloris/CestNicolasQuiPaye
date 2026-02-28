import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link
        href="/feed/hot"
        className="mb-8 font-display text-3xl font-bold text-chainsaw-red"
      >
        NICOLAS PAYE
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
