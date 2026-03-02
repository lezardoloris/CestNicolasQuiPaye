interface CsvColumn<T> {
  key: keyof T;
  header: string;
}

function escapeValue(value: unknown): string {
  const str = value == null ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert an array of objects to a CSV string.
 * Handles escaping of commas, quotes, and newlines in values.
 */
export function toCSV<T>(
  data: T[],
  columns: CsvColumn<T>[],
): string {
  const header = columns.map((c) => escapeValue(c.header)).join(',');
  const rows = data.map((row) =>
    columns.map((c) => escapeValue(row[c.key])).join(','),
  );
  return [header, ...rows].join('\n');
}
