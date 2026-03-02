import { fetchWithRetry } from '@/lib/open-data/client';
import { mapToCategory } from '@/lib/open-data/category-mapper';
import { getSourceConfig } from '@/lib/open-data/sources';
import type { OpenDataRecord } from '@/types/open-data';

const DATASET_ID = 'plf25-depenses-2025-selon-destination';
const BASE_URL = `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/${DATASET_ID}/records`;

interface PlfRecord {
  ministere: string | null;
  libelle_ministere: string | null;
  mission: string | null;
  libelle_mission: string | null;
  programme: string | null;
  libelle_programme: string | null;
  autorisation_engagement: number | null;
  credit_de_paiement: number | null;
  exercice: string | null;
}

interface OdsResponse {
  total_count: number;
  results: PlfRecord[];
}

function buildTitle(record: PlfRecord): string {
  const exercice = record.exercice ?? '2025';
  const programme = record.libelle_programme ?? 'Programme inconnu';
  return `PLF ${exercice}: ${programme}`.slice(0, 200);
}

function buildDescription(record: PlfRecord): string {
  const cp = record.credit_de_paiement?.toLocaleString('fr-FR') ?? '?';
  const programme = record.libelle_programme ?? 'Non renseigné';
  const mission = record.libelle_mission ?? 'Non renseignée';
  const ministere = record.libelle_ministere ?? 'Non renseigné';
  const ae = record.autorisation_engagement?.toLocaleString('fr-FR') ?? '?';
  const exercice = record.exercice ?? '2025';

  return (
    `Crédit budgétaire de ${cp}€ pour le programme '${programme}' ` +
    `(mission '${mission}', ministère '${ministere}'). ` +
    `Autorisations d'engagement : ${ae}€. Exercice ${exercice}.`
  );
}

export async function fetchPlfRecords(): Promise<OpenDataRecord[]> {
  const config = getSourceConfig('plf_budget');
  if (!config?.enabled) return [];

  const records: OpenDataRecord[] = [];
  let offset = 0;

  while (records.length < config.maxRecords) {
    const limit = Math.min(config.batchSize, config.maxRecords - records.length);
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      where: `credit_de_paiement >= ${config.minAmount}`,
      order_by: 'credit_de_paiement DESC',
      select: 'ministere,libelle_ministere,mission,libelle_mission,programme,libelle_programme,autorisation_engagement,credit_de_paiement,exercice',
    });

    const response = await fetchWithRetry(`${BASE_URL}?${params}`);
    const data: OdsResponse = await response.json();

    if (data.results.length === 0) break;

    for (const r of data.results) {
      if (!r.credit_de_paiement || r.credit_de_paiement < config.minAmount) continue;

      const exercice = r.exercice ?? '2025';
      const programme = r.programme ?? 'unknown';
      const mission = r.mission ?? 'unknown';

      records.push({
        externalId: `plf-${exercice}-${programme}-${mission}`,
        title: buildTitle(r),
        description: buildDescription(r),
        amount: r.credit_de_paiement,
        sourceUrl: `https://data.economie.gouv.fr/explore/dataset/${DATASET_ID}/table/`,
        category: mapToCategory(r.libelle_ministere ?? ''),
        importSource: 'plf_budget',
      });
    }

    offset += data.results.length;
    if (data.results.length < limit) break;
  }

  return records;
}
