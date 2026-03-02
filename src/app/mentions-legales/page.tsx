import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description:
    'Mentions légales du site C\u2019est Nicolas Qui Paie — nicoquipaie.co.',
};

export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 pb-20 md:pb-8">
      <h1 className="font-display mb-8 text-3xl font-bold text-text-primary">
        Mentions légales
      </h1>

      <div className="space-y-8 text-text-secondary leading-relaxed">
        {/* Éditeur */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-text-primary">Éditeur</h2>
          <p>
            Le site <strong>nicoquipaie.co</strong> est un projet communautaire
            open source à vocation éducative.
          </p>
          <p className="mt-2">
            Contact :{' '}
            <a
              href="mailto:contact@nicoquipaie.co"
              className="text-chainsaw-red underline hover:text-text-primary"
            >
              contact@nicoquipaie.co
            </a>
          </p>
        </section>

        {/* Hébergement */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-text-primary">
            Hébergement
          </h2>
          <p>
            Le site est hébergé par{' '}
            <strong>Railway Corporation</strong>, 548 Market St, San Francisco,
            CA 94104, États-Unis.
          </p>
          <p className="mt-2">
            Nom de domaine enregistré auprès de{' '}
            <strong>Namecheap, Inc.</strong>, 4600 East Washington Street,
            Suite 305, Phoenix, AZ 85034, États-Unis.
          </p>
        </section>

        {/* Statut hébergeur LCEN */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-text-primary">
            Statut d&apos;hébergeur — Loi LCEN
          </h2>
          <p>
            Conformément à la loi n°&nbsp;2004-575 du 21&nbsp;juin 2004 pour la
            confiance dans l&apos;économie numérique (LCEN), le site agit en
            qualité d&apos;hébergeur pour les contenus publiés par ses
            utilisateurs.
          </p>
          <p className="mt-2">
            Les contributions sont soumises à modération. Les sources doivent
            être croisées et vérifiables avant publication. Tout contenu
            manifestement illicite signalé sera retiré dans les meilleurs délais.
          </p>
          <p className="mt-2">
            Pour signaler un contenu :{' '}
            <a
              href="mailto:contact@nicoquipaie.co"
              className="text-chainsaw-red underline hover:text-text-primary"
            >
              contact@nicoquipaie.co
            </a>
          </p>
        </section>

        {/* Propriété intellectuelle */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-text-primary">
            Propriété intellectuelle
          </h2>
          <p>
            Le code source du site est publié sous{' '}
            <a
              href="https://opensource.org/licenses/MIT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-chainsaw-red underline hover:text-text-primary"
            >
              licence MIT
            </a>
            . Les contributions des utilisateurs (signalements, notes, solutions)
            sont publiées sous la même licence.
          </p>
          <p className="mt-2">
            Les données publiques citées proviennent de sources officielles
            (INSEE, Vie Publique, Cour des comptes, etc.) et sont utilisées dans
            un cadre éducatif et informatif.
          </p>
        </section>

        {/* Responsabilité */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-text-primary">
            Limitation de responsabilité
          </h2>
          <p>
            Les informations diffusées sur le site sont fournies à titre
            indicatif et éducatif. Elles ne constituent en aucun cas un avis
            juridique, financier ou politique.
          </p>
          <p className="mt-2">
            L&apos;éditeur s&apos;efforce d&apos;assurer l&apos;exactitude des
            informations mais ne saurait garantir l&apos;exhaustivité ou
            l&apos;absence d&apos;erreurs. Les montants et estimations sont
            basés sur des sources officielles et peuvent être contestés par la
            communauté.
          </p>
        </section>

        {/* Données personnelles */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-text-primary">
            Données personnelles
          </h2>
          <p>
            Le site collecte uniquement les données nécessaires à son
            fonctionnement : adresse e-mail et pseudonyme lors de
            l&apos;inscription, cookies de session pour l&apos;authentification.
          </p>
          <p className="mt-2">
            Aucune donnée personnelle n&apos;est vendue, cédée ou transmise à
            des tiers à des fins commerciales. Le vote anonyme est possible sans
            création de compte.
          </p>
          <p className="mt-2">
            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de
            rectification et de suppression de vos données. Contact :{' '}
            <a
              href="mailto:contact@nicoquipaie.co"
              className="text-chainsaw-red underline hover:text-text-primary"
            >
              contact@nicoquipaie.co
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
