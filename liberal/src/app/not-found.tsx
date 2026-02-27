import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <h2 className="text-4xl font-display font-bold text-chainsaw-red">404</h2>
      <p className="text-xl font-display font-semibold text-text-primary">
        Cette page coute 0 EUR
      </p>
      <p className="text-text-secondary max-w-md">
        La page que vous cherchez n&apos;existe pas ou a ete supprimee.
      </p>
      <Link
        href="/feed/hot"
        className="text-chainsaw-red hover:text-chainsaw-red-hover font-medium underline underline-offset-4"
      >
        Retour au feed
      </Link>
    </div>
  );
}
