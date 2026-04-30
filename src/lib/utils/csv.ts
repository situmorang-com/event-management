/** Minimal RFC-4180 CSV parser — handles quoted fields, CRLF/LF, empty lines */
export function parseCSV(raw: string): Record<string, string>[] {
  const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const nonEmpty = lines.filter((l) => l.trim() !== '');
  if (nonEmpty.length < 2) return [];

  const headers = splitRow(nonEmpty[0]).map((h) => h.trim().toLowerCase());

  return nonEmpty.slice(1).map((line) => {
    const vals = splitRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (vals[i] ?? '').trim();
    });
    return row;
  });
}

function splitRow(line: string): string[] {
  const fields: string[] = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuote = !inQuote;
      }
    } else if (ch === ',' && !inQuote) {
      fields.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}
