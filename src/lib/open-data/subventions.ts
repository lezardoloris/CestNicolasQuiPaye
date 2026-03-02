import { fetchWithRetry } from '@/lib/open-data/client';
import { mapToCategory } from '@/lib/open-data/category-mapper';
import { getSourceConfig } from '@/lib/open-data/sources';
import type { OpenDataRecord } from '@/types/open-data';

const DATASET_SLUG = 'subventions-versees-aux-associations';
const DATASET_API = `https://www.data.gouv.fr/api/1/datasets/${DATASET_SLUG}/`;

interface DataGouvResource {
  id: string;
  url: string;
  format: string;
  title: string;
}

interface DataGouvDataset {
  resources: DataGouvResource[];
}

interface SubventionRow {
  id_subvention?: string;
  objet?: string;
  montant?: string | number;
  beneficiaire?: string;
  attribuant?: string;
  date_versement?: string;
}

function parseAmount(value: string | number | undefined): number {
  if (value === undefined || value === null || value === '') return 0;
  if (typeof value === 'number') return value;
  return parseFloat(value.replace(/\s/g, '').replace(',', '.')) || 0;
}

function buildTitle(row: SubventionRow): string {
  const objet = row.objet ?? 'Subvention publique';
  return `Subvention : ${objet}`.slice(0, 200);
}

function buildDescription(row: SubventionRow): string {
  const montant = parseAmount(row.montant).toLocaleString('fr-FR');
  const beneficiaire = row.beneficiaire ?? 'Non renseigné';
  const attribuant = row.attribuant ?? 'Non renseigné';
  const objet = row.objet ?? 'Non renseigné';
  const date = row.date_versement ?? 'Non renseignée';

  return (
    `Subvention de ${montant}€ versée à ${beneficiaire} par ${attribuant}. ` +
    `Objet : ${objet}. Date : ${date}.`
  );
}

function generateExternalId(row: SubventionRow, index: number): string {
  if (row.id_subvention) return `sub-${row.id_subvention}`;
  // Fallback: deterministic hash from key fields
  const key = `${row.beneficiaire ?? ''}-${row.montant ?? ''}-${row.date_versement ?? ''}-${index}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  return `sub-${Math.abs(hash).toString(36)}`;
}

async function findCsvResourceUrl(): Promise<string | null> {
  const response = await fetchWithRetry(DATASET_API);
  const dataset: DataGouvDataset = await response.json();

  // Prefer CSV, fallback to JSON
  const csvResource = dataset.resources.find(
    (r) => r.format.toLowerCase() === 'csv' && r.url,
  );
  if (csvResource) return csvResource.url;

  const jsonResource = dataset.resources.find(
    (r) => r.format.toLowerCase() === 'json' && r.url,
  );
  return jsonResource?.url ?? null;
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ';' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCsvToRows(csvText: string): SubventionRow[] {
  const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) =>
    h
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_]/g, '_'),
  );

  const rows: SubventionRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j] ?? '';
    }

    rows.push({
      id_subvention: obj['id_subvention'] || obj['id'] || undefined,
      objet: obj['objet'] || obj['objet_subvention'] || undefined,
      montant: obj['montant'] || obj['montant_verse'] || undefined,
      beneficiaire: obj['beneficiaire'] || obj['nom_beneficiaire'] || undefined,
      attribuant: obj['attribuant'] || obj['nom_attribuant'] || undefined,
      date_versement: obj['date_versement'] || obj['date'] || undefined,
    });
  }

  return rows;
}

export async function fetchSubventionRecords(): Promise<OpenDataRecord[]> {
  const config = getSourceConfig('subventions');
  if (!config?.enabled) return [];

  const resourceUrl = await findCsvResourceUrl();
  if (!resourceUrl) {
    console.warn('[subventions] No CSV/JSON resource found on data.gouv.fr');
    return [];
  }

  const response = await fetchWithRetry(resourceUrl, {
    headers: { Accept: 'text/csv, application/json' },
  });

  const contentType = response.headers.get('content-type') ?? '';
  let allRows: SubventionRow[];

  if (contentType.includes('json')) {
    allRows = await response.json();
  } else {
    const text = await response.text();
    allRows = parseCsvToRows(text);
  }

  const records: OpenDataRecord[] = [];
  for (let i = 0; i < allRows.length && records.length < config.maxRecords; i++) {
    const row = allRows[i];
    const amount = parseAmount(row.montant);
    if (amount < config.minAmount) continue;

    records.push({
      externalId: generateExternalId(row, i),
      title: buildTitle(row),
      description: buildDescription(row),
      amount,
      sourceUrl: `https://www.data.gouv.fr/fr/datasets/${DATASET_SLUG}/`,
      category: mapToCategory(row.attribuant ?? ''),
      importSource: 'subventions',
    });
  }

  return records;
}
