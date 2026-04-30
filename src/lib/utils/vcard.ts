/** Minimal vCard 3.0/4.0 parser — extracts name, email, tel, org, title from a .vcf file */
export function parseVCard(raw: string): Record<string, string>[] {
  // Unfold lines: a leading space/tab continues the previous line (RFC 6350 §3.2)
  const unfolded = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n[ \t]/g, '');
  const lines = unfolded.split('\n');

  const cards: Record<string, string>[] = [];
  let current: Record<string, string> | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^BEGIN:VCARD$/i.test(trimmed)) {
      current = {};
      continue;
    }
    if (/^END:VCARD$/i.test(trimmed)) {
      if (current && (current.name || current.email)) cards.push(current);
      current = null;
      continue;
    }
    if (!current) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;
    const head = trimmed.slice(0, colonIdx);
    const value = decodeValue(trimmed.slice(colonIdx + 1), head);
    // Strip optional item prefix macOS adds: "item1.EMAIL" → "EMAIL"
    const rawProp = head.split(';')[0];
    const propName = rawProp.replace(/^item\d+\./i, '').toUpperCase();

    switch (propName) {
      case 'FN':
        if (!current.name) current.name = value;
        break;
      case 'N':
        // N:Family;Given;Additional;Prefix;Suffix → "Given Family"
        if (!current.name) {
          const parts = value.split(';');
          const given = (parts[1] ?? '').trim();
          const family = (parts[0] ?? '').trim();
          const joined = [given, family].filter(Boolean).join(' ');
          if (joined) current.name = joined;
        }
        break;
      case 'EMAIL':
        if (!current.email && value) current.email = value.toLowerCase();
        break;
      case 'TEL':
        if (!current.whatsapp && value) current.whatsapp = normalizePhone(value);
        break;
      case 'ORG':
        if (!current.company) current.company = value.split(';')[0].trim();
        break;
      case 'TITLE':
        if (!current.role) current.role = value;
        break;
    }
  }

  return cards;
}

function decodeValue(value: string, head: string): string {
  const headUpper = head.toUpperCase();
  let v = value;
  if (/ENCODING=QUOTED-PRINTABLE/.test(headUpper)) {
    v = v.replace(/=([0-9A-F]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
  }
  // Unescape backslash sequences (RFC 6350 §3.4)
  v = v.replace(/\\n/gi, ' ').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
  return v.trim();
}

function normalizePhone(value: string): string {
  return value.replace(/[^\d+]/g, '');
}
