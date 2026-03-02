import { fetchWithRetry } from '@/lib/open-data/client';
import { mapToCategory } from '@/lib/open-data/category-mapper';
import { getSourceConfig } from '@/lib/open-data/sources';
import type { OpenDataRecord } from '@/types/open-data';

const DATASET_ID = 'decp-v3-marches-valides';
const BASE_URL = `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/${DATASET_ID}/records`;

interface DecpRecord {
  id: string;
  objet: string | null;
  montant: number | null;
  acheteur_id: string | null;
  titulaire_denominationsociale_1: string | null;
  datenotification: string | null;
  dureemois: number | null;
  lieuexecution_nom: string | null;
  nature: string | null;
}

interface OdsResponse {
  total_count: number;
  results: DecpRecord[];
}

function buildTitle(record: DecpRecord): string {
  const nature = record.nature ?? 'Marché';
  const objet = record.objet ?? 'Sans objet';
  return `${nature}: ${objet}`.slice(0, 200);
}

function buildDescription(record: DecpRecord): string {
  const montant = record.montant?.toLocaleString('fr-FR') ?? '?';
  const titulaire = record.titulaire_denominationsociale_1 ?? 'Non renseigné';
  const acheteur = record.acheteur_id ?? 'Non renseigné';
  const duree = record.dureemois ? `${record.dureemois} mois` : 'Non renseignée';
  const lieu = record.lieuexecution_nom ?? 'Non renseigné';
  const date = record.datenotification ?? 'Non renseignée';

  return (
    `Marché public de ${montant}€ attribué à ${titulaire} par ${acheteur}. ` +
    `Durée : ${duree}. Lieu : ${lieu}. Notifié le ${date}.`
  );
}

export async function fetchDecpRecords(): Promise<OpenDataRecord[]> {
  const config = getSourceConfig('decp');
  if (!config?.enabled) return [];

  const records: OpenDataRecord[] = [];
  let offset = 0;

  while (records.length < config.maxRecords) {
    const limit = Math.min(config.batchSize, config.maxRecords - records.length);
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      where: `montant >= ${config.minAmount}`,
      order_by: 'datenotification DESC',
      select: 'id,objet,montant,acheteur_id,titulaire_denominationsociale_1,datenotification,dureemois,lieuexecution_nom,nature',
    });

    const response = await fetchWithRetry(`${BASE_URL}?${params}`);
    const data: OdsResponse = await response.json();

    if (data.results.length === 0) break;

    for (const r of data.results) {
      if (!r.id || !r.montant || r.montant < config.minAmount) continue;

      records.push({
        externalId: `decp-${r.id}`,
        title: buildTitle(r),
        description: buildDescription(r),
        amount: r.montant,
        sourceUrl: `https://data.economie.gouv.fr/explore/dataset/${DATASET_ID}/table/?q=id:${r.id}`,
        category: mapToCategory(r.acheteur_id ?? ''),
        importSource: 'decp',
      });
    }

    offset += data.results.length;
    if (data.results.length < limit) break;
  }

  return records;
}
