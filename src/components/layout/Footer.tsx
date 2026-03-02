export default function Footer() {
  return (
    <footer className="hidden md:block border-t border-border-default bg-surface-primary py-8 px-6">
      <div className="mx-auto max-w-5xl flex flex-col gap-4 text-text-muted text-sm">
        <p>
          C'est Nicolas Qui Paie &mdash; La communauté open source pour tronçonner les dépenses publiques. Licence{' '}
          <a
            href="https://opensource.org/licenses/MIT"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-text-secondary"
          >
            MIT
          </a>
          .
        </p>
        <p>
          Données officielles issues de sources publiques. Les montants et
          estimations sont fournis à titre indicatif et ne constituent pas un
          avis juridique ou financier.
        </p>
        <p>
          <a href="/methodologie" className="underline hover:text-text-secondary">
            Méthodologie et sources
          </a>
          {' · '}
          <a href="/developers" className="underline hover:text-text-secondary">
            API Publique / Open Data
          </a>
          {' · '}
          <a href="/mentions-legales" className="underline hover:text-text-secondary">
            Mentions légales
          </a>
          {' · '}
          <a href="/cgu" className="underline hover:text-text-secondary">
            CGU
          </a>
        </p>
      </div>
    </footer>
  );
}
