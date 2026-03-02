import type { Metadata } from 'next';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'API Publique Open Data - Nicolas Paye',
  description:
    'Documentation de l\'API publique Open Data de nicoquipaie.co. Accès libre aux données des dépenses publiques françaises.',
};

// ─── Endpoint definitions ────────────────────────────────────────

interface Param {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue?: string;
}

interface Endpoint {
  method: string;
  path: string;
  description: string;
  params: Param[];
  exampleUrl: string;
}

const BASE_URL = 'https://nicoquipaie.co';

const endpoints: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/v1/submissions',
    description: 'Liste paginée des dépenses publiques approuvées, avec filtres et tri.',
    params: [
      { name: 'sort', type: 'string', required: false, description: 'hot | new | top | amount', defaultValue: 'new' },
      { name: 'limit', type: 'number', required: false, description: 'Nombre de résultats (1-100)', defaultValue: '20' },
      { name: 'cursor', type: 'string', required: false, description: 'Curseur de pagination (fourni dans la réponse)' },
      { name: 'category', type: 'string', required: false, description: 'Filtrer par catégorie (ex: Défense, Santé)' },
      { name: 'amountMin', type: 'number', required: false, description: 'Montant minimum en EUR' },
      { name: 'amountMax', type: 'number', required: false, description: 'Montant maximum en EUR' },
      { name: 'dateFrom', type: 'string', required: false, description: 'Date de début (ISO 8601)' },
      { name: 'dateTo', type: 'string', required: false, description: 'Date de fin (ISO 8601)' },
      { name: 'timeWindow', type: 'string', required: false, description: 'today | week | month | all', defaultValue: 'all' },
    ],
    exampleUrl: '/api/v1/submissions?sort=top&limit=5',
  },
  {
    method: 'GET',
    path: '/api/v1/submissions/:id',
    description: 'Détail complet d\'une soumission : sources, notes communautaires, solutions, calculs de coût.',
    params: [
      { name: 'id', type: 'uuid', required: true, description: 'Identifiant de la soumission' },
    ],
    exampleUrl: '/api/v1/submissions/{id}',
  },
  {
    method: 'GET',
    path: '/api/v1/submissions/export',
    description: 'Export complet des soumissions approuvées en JSON ou CSV.',
    params: [
      { name: 'format', type: 'string', required: false, description: 'json | csv', defaultValue: 'json' },
      { name: 'category', type: 'string', required: false, description: 'Filtrer par catégorie' },
      { name: 'dateFrom', type: 'string', required: false, description: 'Date de début (ISO 8601)' },
      { name: 'dateTo', type: 'string', required: false, description: 'Date de fin (ISO 8601)' },
    ],
    exampleUrl: '/api/v1/submissions/export?format=csv',
  },
  {
    method: 'GET',
    path: '/api/v1/stats',
    description: 'Statistiques agrégées : totaux, répartition par catégorie, top 10, évolution temporelle.',
    params: [],
    exampleUrl: '/api/v1/stats',
  },
  {
    method: 'GET',
    path: '/api/v1/categories',
    description: 'Liste des 16 catégories de dépenses publiques.',
    params: [],
    exampleUrl: '/api/v1/categories',
  },
  {
    method: 'GET',
    path: '/api/v1/search',
    description: 'Recherche dans les titres et descriptions des soumissions.',
    params: [
      { name: 'q', type: 'string', required: true, description: 'Terme de recherche (2-200 caractères)' },
      { name: 'limit', type: 'number', required: false, description: 'Nombre de résultats (1-100)', defaultValue: '20' },
      { name: 'cursor', type: 'string', required: false, description: 'Curseur de pagination' },
      { name: 'category', type: 'string', required: false, description: 'Filtrer par catégorie' },
    ],
    exampleUrl: '/api/v1/search?q=defense&limit=10',
  },
];

// ─── Components ──────────────────────────────────────────────────

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  return (
    <section className="rounded-xl border border-border-default bg-surface-primary p-6">
      <div className="mb-3 flex items-center gap-3">
        <span className="rounded-md bg-accent-primary/10 px-2.5 py-1 font-mono text-sm font-semibold text-accent-primary">
          {endpoint.method}
        </span>
        <code className="text-sm text-text-primary">{endpoint.path}</code>
      </div>
      <p className="mb-4 text-sm text-text-muted">{endpoint.description}</p>

      {endpoint.params.length > 0 && (
        <div className="mb-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-default text-text-muted">
                <th className="pb-2 pr-4 font-medium">Paramètre</th>
                <th className="pb-2 pr-4 font-medium">Type</th>
                <th className="pb-2 pr-4 font-medium">Requis</th>
                <th className="pb-2 pr-4 font-medium">Défaut</th>
                <th className="pb-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {endpoint.params.map((p) => (
                <tr key={p.name} className="border-b border-border-default/50">
                  <td className="py-2 pr-4 font-mono text-xs text-accent-primary">{p.name}</td>
                  <td className="py-2 pr-4 text-text-muted">{p.type}</td>
                  <td className="py-2 pr-4">{p.required ? 'Oui' : 'Non'}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-text-muted">{p.defaultValue ?? '-'}</td>
                  <td className="py-2 text-text-secondary">{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-lg bg-surface-elevated p-3">
        <p className="mb-1 text-xs font-medium text-text-muted">Exemple</p>
        <code className="break-all text-xs text-text-secondary">
          curl {BASE_URL}{endpoint.exampleUrl}
        </code>
      </div>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────

export default function DevelopersPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 pb-20 md:pb-12">
      {/* Hero */}
      <div className="mb-12">
        <h1 className="mb-3 text-3xl font-bold text-text-primary">
          API Publique Open Data
        </h1>
        <p className="mb-4 text-lg text-text-secondary">
          Accès libre et gratuit aux données des dépenses publiques françaises
          soumises par les citoyens sur Nicolas Paye.
        </p>
        <div className="rounded-lg bg-surface-elevated p-4">
          <p className="mb-1 text-sm font-medium text-text-muted">Base URL</p>
          <code className="text-sm text-accent-primary">{BASE_URL}/api/v1</code>
        </div>
      </div>

      {/* Response format */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-text-primary">
          Format de réponse
        </h2>
        <p className="mb-3 text-sm text-text-secondary">
          Toutes les réponses suivent la même enveloppe JSON :
        </p>
        <pre className={cn(
          'overflow-x-auto rounded-lg bg-surface-elevated p-4 text-xs text-text-secondary',
        )}>
{`{
  "data": [ ... ],       // Les données demandées
  "error": null,          // null en cas de succès, objet d'erreur sinon
  "meta": {
    "requestId": "uuid",  // Identifiant unique de la requête
    "cursor": "abc...",    // Curseur pour la page suivante (si applicable)
    "hasMore": true        // Indique s'il y a plus de résultats
  }
}`}
        </pre>
      </section>

      {/* Endpoints */}
      <section className="mb-12">
        <h2 className="mb-6 text-xl font-semibold text-text-primary">
          Endpoints
        </h2>
        <div className="flex flex-col gap-6">
          {endpoints.map((ep) => (
            <EndpointCard key={ep.path} endpoint={ep} />
          ))}
        </div>
      </section>

      {/* Pagination */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-text-primary">
          Pagination
        </h2>
        <p className="mb-3 text-sm text-text-secondary">
          Les endpoints paginés utilisent un système de curseur. Si{' '}
          <code className="text-accent-primary">meta.hasMore</code> est{' '}
          <code>true</code>, passez la valeur de{' '}
          <code className="text-accent-primary">meta.cursor</code> dans le
          paramètre <code>cursor</code> de la requête suivante.
        </p>
        <pre className="overflow-x-auto rounded-lg bg-surface-elevated p-4 text-xs text-text-secondary">
{`# Première page
curl ${BASE_URL}/api/v1/submissions?limit=10

# Page suivante (avec le curseur reçu)
curl ${BASE_URL}/api/v1/submissions?limit=10&cursor=eyJpZCI6Ii4uLiJ9`}
        </pre>
      </section>

      {/* Rate limiting */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-text-primary">
          Limites d&apos;utilisation
        </h2>
        <div className="rounded-lg border border-border-default bg-surface-primary p-4">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-yellow-500/10 px-2.5 py-1 text-sm font-semibold text-yellow-600">
              100 req/min
            </span>
            <span className="text-sm text-text-secondary">par adresse IP</span>
          </div>
          <p className="mt-2 text-sm text-text-muted">
            En cas de dépassement, l&apos;API retourne un code HTTP 429. Les
            réponses incluent des headers de cache pour réduire les appels
            inutiles.
          </p>
        </div>
      </section>

      {/* CORS */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-text-primary">
          CORS
        </h2>
        <p className="text-sm text-text-secondary">
          L&apos;API accepte les requêtes depuis n&apos;importe quelle origine
          (<code>Access-Control-Allow-Origin: *</code>). Vous pouvez
          l&apos;appeler directement depuis le navigateur.
        </p>
      </section>

      {/* License */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-text-primary">
          Licence des données
        </h2>
        <p className="text-sm text-text-secondary">
          Les données sont mises à disposition sous licence{' '}
          <a
            href="https://opendatacommons.org/licenses/by/1-0/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-text-primary"
          >
            Open Data Commons Attribution (ODC-BY)
          </a>
          . Vous êtes libre de les utiliser, partager et adapter, à condition de
          mentionner la source : <strong>nicoquipaie.co</strong>.
        </p>
      </section>

      {/* Contact */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-text-primary">
          Contact
        </h2>
        <p className="text-sm text-text-secondary">
          Questions, suggestions ou projets utilisant l&apos;API ? Ouvrez une
          issue sur le{' '}
          <a
            href="https://github.com/nicoquipaie"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-text-primary"
          >
            dépôt GitHub
          </a>{' '}
          du projet.
        </p>
      </section>
    </main>
  );
}
