import type { OpenDataSourceConfig } from '@/types/open-data';

export const OPEN_DATA_SOURCES: OpenDataSourceConfig[] = [
  {
    key: 'decp',
    label: 'Marchés publics (DECP)',
    enabled: true,
    batchSize: 100,
    maxRecords: 500,
    minAmount: 100_000,
  },
  {
    key: 'plf_budget',
    label: 'Budget de l\'État (PLF)',
    enabled: true,
    batchSize: 50,
    maxRecords: 200,
    minAmount: 1_000_000,
  },
  {
    key: 'subventions',
    label: 'Subventions publiques',
    enabled: true,
    batchSize: 100,
    maxRecords: 500,
    minAmount: 50_000,
  },
];

const SOURCE_MAP = new Map(OPEN_DATA_SOURCES.map((s) => [s.key, s]));

export function getSourceConfig(key: string): OpenDataSourceConfig | undefined {
  return SOURCE_MAP.get(key as OpenDataSourceConfig['key']);
}
