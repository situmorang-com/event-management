import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { db } from '$lib/server/db';
import { conferences } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

// Module-level font cache — fetched once per process lifetime
let fontRegular: ArrayBuffer | null = null;
let fontBold: ArrayBuffer | null = null;

async function loadFonts() {
  if (fontRegular && fontBold) return;
  // Satori supports TTF/OTF/WOFF, but not WOFF2.
  const [r, b] = await Promise.all([
    fetch('https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf'),
    fetch('https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf')
  ]);
  if (!r.ok || !b.ok) throw new Error('Failed to fetch OG fonts');
  fontRegular = await r.arrayBuffer();
  fontBold = await b.arrayBuffer();
}

function renderFallbackSvg() {
  return `
    <svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#0f172a" />
      <rect x="-120" y="-80" width="620" height="620" rx="310" fill="#4338ca" fill-opacity="0.22" />
      <rect x="720" y="120" width="380" height="380" rx="190" fill="#0ea5e9" fill-opacity="0.18" />
      <rect x="72" y="72" width="1056" height="486" rx="36" fill="white" fill-opacity="0.06" stroke="white" stroke-opacity="0.14" />
      <rect x="72" y="470" width="260" height="16" rx="8" fill="white" fill-opacity="0.22" />
      <rect x="72" y="506" width="460" height="16" rx="8" fill="white" fill-opacity="0.14" />
      <rect x="72" y="120" width="180" height="18" rx="9" fill="#93c5fd" fill-opacity="0.7" />
      <rect x="72" y="176" width="720" height="68" rx="18" fill="white" fill-opacity="0.92" />
      <rect x="72" y="268" width="880" height="30" rx="12" fill="white" fill-opacity="0.3" />
      <rect x="72" y="320" width="620" height="30" rx="12" fill="white" fill-opacity="0.18" />
    </svg>
  `;
}

export const GET: RequestHandler = async ({ params }) => {
  const conf = await db.query.conferences.findFirst({
    where: eq(conferences.slug, params.slug)
  });
  if (!conf) throw error(404, 'Not found');

  try {
    await loadFonts();
  } catch {
    // If font load fails, return a simple colored placeholder
    return new Response(null, { status: 503, statusText: 'Font unavailable' });
  }

  const startsAt = new Date(conf.startsAt);
  const dateStr = startsAt.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  let svg: string;
  try {
    svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '60px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
            fontFamily: 'Inter'
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  fontSize: '20px',
                  color: '#94a3b8',
                  marginBottom: '16px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                },
                children: 'Conference'
              }
            },
            {
              type: 'div',
              props: {
                style: {
                  fontSize: conf.name.length > 40 ? '48px' : '60px',
                  fontWeight: 700,
                  color: '#f1f5f9',
                  lineHeight: 1.2,
                  marginBottom: '24px'
                },
                children: conf.name
              }
            },
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  gap: '32px',
                  color: '#94a3b8',
                  fontSize: '22px'
                },
                children: [
                  {
                    type: 'span',
                    props: { children: `Date: ${dateStr}` }
                  },
                  conf.venue
                    ? { type: 'span', props: { children: `Venue: ${conf.venue}` } }
                    : null
                ].filter(Boolean)
              }
            }
          ]
        }
      },
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: 'Inter', data: fontRegular!, weight: 400, style: 'normal' },
          { name: 'Inter', data: fontBold!, weight: 700, style: 'normal' }
        ]
      }
    );
  } catch (err) {
    console.error('OG image render failed, using fallback SVG', err);
    svg = renderFallbackSvg();
  }

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();

  return new Response(new Uint8Array(png), {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, max-age=3600, stale-while-revalidate=86400'
    }
  });
};
