export type ImportSource = 'decp' | 'plf_budget' | 'subventions';

export interface OpenDataRecord {
  externalId: string;
  title: string;
  description: string;
  amount: number;
  sourceUrl: string;
  category: string;
  importSource: ImportSource;
}

export interface ImportResult {
  source: ImportSource;
  fetched: number;
  inserted: number;
  skipped: number;
  errors: string[];
}

export interface OpenDataSourceConfig {
  key: ImportSource;
  label: string;
  enabled: boolean;
  batchSize: number;
  maxRecords: number;
  minAmount: number;
}
