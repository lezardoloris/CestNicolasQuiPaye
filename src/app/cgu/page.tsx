import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description:
    "Conditions générales d'utilisation du site C\u2019est Nicolas Qui Paie — nicoquipaie.co.",
};

export default function CGUPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 pb-20 md:pb-8">
      <h1 className="font-display mb-8 text-3xl font-bold text-text-primary">
        Conditions Générales d&apos;Utilisation
      </h1>

      <div className="space-y-8 text-text-secondary leading-relaxed">
        {/* Objet */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-text-primary">
            Objet du site
          </h2>
          <p>
            <strong>nicoquipaie.co</strong> est une plateforme citoyenne,
            éducative et open source permettant de documenter, consulter et voter
            sur les dépenses publiques françaises. Le site n&apos;a aucune
            affiliation politique.
          </p>
        </section>

        {/* Accès */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-text-primary">
            Accès au site
          </h2>
          <p>
            La consultation du site est libre et gratuite. Certaines
            fonctionnalités (soumettre un signalement, commenter, proposer une
            solution) nécessitent la création d&apos;un compte.
          </p>
          <p className="mt-2">
            Le vote sur les dépenses est accessible sans compte.
          </p>
        </section>

        {/* Contributions */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-text-primary">
            Contributions des utilisateurs
          </h2>
          <p>En contribuant sur le site, l&apos;utilisateur s&apos;engage à :</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              Fournir des informations factuelles et vérifiables, accompagnées de
              sources officielles ou médiatiques.
            </li>
            <li>
              Ne publier aucun contenu diffamatoire, injurieux, discriminatoire
              ou portant atteinte à la vie privée.
            </li>
            <li>
              Respecter la législation française en vigueur, notamment la loi sur
              la liberté de la presse du 29&nbsp;juillet 1881.
            </li>
          </ul>
          <p className="mt-2">
            Toute contribution est soumise à modération. Les sources doivent être
            croisées et vérifiables avant publication. L&apos;équipe de
            modération se réserve le droit de refuser ou supprimer tout contenu
            ne respectant pas ces règles.
          </p>
        </section>

        {/* Modération et LCEN */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-text-primary">
            Modération et signalement
          </h2>
          <p>
            Conformément à la loi LCEN (n°&nbsp;2004-575 du 21&nbsp;juin 2004),
            le site agit en qualité d&apos;hébergeur. Tout contenu
            manifestement illicite signalé sera examiné et, le cas échéant,
            retiré dans les meilleurs délais.
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
            Le code source est publié sous{' '}
            <a
              href="https://opensource.org/licenses/MIT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-chainsaw-red underline hover:text-text-primary"
            >
              licence MIT
            </a>
            . En soumettant du contenu, l&apos;utilisateur accorde une licence
            non exclusive et gratuite de diffusion sur la plateforme, sous les
            mêmes termes.
          </p>
        </section>

        {/* Responsabilité */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-text-primary">
            Limitation de responsabilité
          </h2>
          <p>
            Les informations publiées sont fournies à titre indicatif et
            éducatif. Elles ne constituent pas un avis juridique, financier ou
            politique.
          </p>
          <p className="mt-2">
            Le site ne saurait être tenu responsable des contenus publiés par les
            utilisateurs, sous réserve des obligations prévues par la loi LCEN.
            Les montants et estimations sont basés sur des sources officielles et
            peuvent être contestés par la communauté.
          </p>
        </section>

        {/* Données personnelles */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-text-primary">
            Données personnelles
          </h2>
          <p>
            Les données collectées (e-mail, pseudonyme) servent uniquement au
            fonctionnement du site. Aucune donnée n&apos;est vendue ou transmise
            à des tiers à des fins commerciales.
          </p>
          <p className="mt-2">
            Conformément au RGPD, vous pouvez exercer vos droits d&apos;accès,
            de rectification et de suppression en écrivant à{' '}
            <a
              href="mailto:contact@nicoquipaie.co"
              className="text-chainsaw-red underline hover:text-text-primary"
            >
              contact@nicoquipaie.co
            </a>
            .
          </p>
        </section>

        {/* Modification */}
        <section>
          <h2 className="mb-3 text-xl font-bold text-text-primary">
            Modification des CGU
          </h2>
          <p>
            Les présentes conditions peuvent être mises à jour à tout moment. La
            version en vigueur est celle accessible sur cette page.
          </p>
        </section>
      </div>
    </main>
  );
}
