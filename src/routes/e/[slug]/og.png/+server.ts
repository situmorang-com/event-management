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
  // Fetch Inter from Google Fonts CDN — reliable, CORS-open for server fetches
  const [r, b] = await Promise.all([
    fetch('https://fonts.gstatic.com/s/inter/v18/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2'),
    fetch('https://fonts.gstatic.com/s/inter/v18/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2pL7SUc.woff2')
  ]);
  fontRegular = await r.arrayBuffer();
  fontBold = await b.arrayBuffer();
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

  const svg = await satori(
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
                  props: { children: `📅 ${dateStr}` }
                },
                conf.venue
                  ? { type: 'span', props: { children: `📍 ${conf.venue}` } }
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

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
    .render()
    .asPng();

  return new Response(new Uint8Array(png), {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, max-age=3600, stale-while-revalidate=86400'
    }
  });
};
