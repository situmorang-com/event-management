<script lang="ts">
  import { page } from '$app/state';
  let { data, form } = $props();
  const c = data.conference;

  const tz = c.timezone ?? 'UTC';
  const tierMap = new Map(data.tiers.map((t) => [t.id, t]));
  const grouped = data.sponsors.reduce<Record<string, typeof data.sponsors>>((acc, s) => {
    const key = s.tierId ?? '__none__';
    (acc[key] ??= []).push(s);
    return acc;
  }, {});
  const tierOrder = [...data.tiers].sort((a, b) => b.rank - a.rank);

  const ogImage = `${page.url.origin}/e/${c.slug}/og.png`;
  const canonicalUrl = `${page.url.origin}/e/${c.slug}`;

  const fmtDate = (d: Date) => new Date(d).toLocaleDateString('en-US', {
    timeZone: tz, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const fmtTime = (d: Date) => new Date(d).toLocaleTimeString('en-US', {
    timeZone: tz, hour: '2-digit', minute: '2-digit'
  });

  const dateStr = fmtDate(c.startsAt);
  const timeStr = `${fmtTime(c.startsAt)} – ${fmtTime(c.endsAt)}`;
  const ogDescription = [
    c.description?.slice(0, 120) ?? '',
    c.venue ? `📍 ${c.venue}` : '',
    `📅 ${dateStr}`
  ].filter(Boolean).join(' · ');
</script>

<svelte:head>
  <title>{c.name}</title>
  <meta name="description" content={ogDescription} />
  <link rel="canonical" href={canonicalUrl} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={c.name} />
  <meta property="og:description" content={ogDescription} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={c.name} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={c.name} />
  <meta name="twitter:description" content={ogDescription} />
  <meta name="twitter:image" content={ogImage} />
</svelte:head>

<!-- Hero -->
<div class="relative -mx-4 -mt-8 overflow-hidden px-4 pb-16 pt-20 sm:-mx-8 sm:px-8">
  <!-- Background gradient -->
  <div class="pointer-events-none absolute inset-0 -z-10">
    <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
    <div class="absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl"></div>
    <div class="absolute right-1/4 top-1/4 h-72 w-72 rounded-full bg-violet-600/15 blur-3xl"></div>
  </div>

  <div class="mx-auto max-w-3xl text-center animate-fade-up">
    <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-indigo-300">
      Invitation
    </div>
    <h1 class="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
      {c.name}
    </h1>

    <div class="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-300">
      <!-- Date -->
      <div class="flex items-center gap-2">
        <svg class="h-4 w-4 shrink-0 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/>
        </svg>
        <span>{dateStr}</span>
      </div>
      <!-- Time -->
      <div class="flex items-center gap-2">
        <svg class="h-4 w-4 shrink-0 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
        </svg>
        <span>{timeStr}</span>
      </div>
      <!-- Venue -->
      {#if c.venue}
        <div class="flex items-center gap-2">
          <svg class="h-4 w-4 shrink-0 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
          </svg>
          <span>{c.venue}</span>
        </div>
      {/if}
    </div>
  </div>
</div>

<div class="mx-auto max-w-2xl">
  <!-- Description -->
  {#if c.description}
    <div class="mt-10 animate-fade-up" style="animation-delay:0.1s">
      <p class="whitespace-pre-wrap leading-relaxed text-slate-600">{c.description}</p>
    </div>
  {/if}

  <!-- Register card -->
  <div class="mt-10 animate-fade-up" style="animation-delay:0.15s">
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lift">
      <div class="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
        <h2 class="text-lg font-semibold">Register for this event</h2>
        {#if c.capacity && !data.isFull && !data.isClosed}
          <p class="mt-0.5 text-sm text-slate-500">{data.registered} / {c.capacity} spots filled</p>
        {/if}
      </div>

      <div class="px-6 py-5">
        {#if form?.ok}
          <div class="flex flex-col items-center gap-3 py-6 text-center">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg class="h-7 w-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
              </svg>
            </div>
            <div>
              <p class="font-semibold text-slate-900">{form.dedup ? "You're already registered!" : "You're in! 🎉"}</p>
              <p class="mt-1 text-sm text-slate-500">Check your email for your ticket confirmation.</p>
            </div>
            <a class="btn-primary mt-2" href={`/ticket/${form.ticketCode}`}>View your ticket →</a>
          </div>
        {:else if data.isClosed}
          <p class="py-4 text-center text-sm text-slate-500">Registration has closed for this event.</p>
        {:else if data.isFull}
          <p class="py-4 text-center text-sm text-slate-500">This event is fully booked.</p>
        {:else}
          <form method="POST" class="space-y-4">
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="block sm:col-span-2">
                <span class="text-sm font-medium text-slate-700">Name <span class="text-red-500">*</span></span>
                <input name="name" required class="input mt-1" placeholder="Your full name" value={form?.values?.name ?? ''} />
              </label>
              <label class="block sm:col-span-2">
                <span class="text-sm font-medium text-slate-700">Email <span class="text-red-500">*</span></span>
                <input type="email" name="email" required autocomplete="email" class="input mt-1" placeholder="you@company.com" value={form?.values?.email ?? ''} />
              </label>
              <label class="block">
                <span class="text-sm font-medium text-slate-700">Company</span>
                <input name="company" class="input mt-1" placeholder="Your company" value={form?.values?.company ?? ''} />
              </label>
              <label class="block">
                <span class="text-sm font-medium text-slate-700">Role / Title</span>
                <input name="role" class="input mt-1" placeholder="e.g. CIO" value={form?.values?.role ?? ''} />
              </label>
              <label class="block">
                <span class="text-sm font-medium text-slate-700">Industry</span>
                <input name="industry" class="input mt-1" placeholder="e.g. Financial Services" value={form?.values?.industry ?? ''} />
              </label>
              <label class="block">
                <span class="text-sm font-medium text-slate-700">Company size</span>
                <select name="companySize" class="input mt-1">
                  <option value="">Select size</option>
                  <option value="1-10" selected={form?.values?.companySize === '1-10'}>1–10</option>
                  <option value="11-50" selected={form?.values?.companySize === '11-50'}>11–50</option>
                  <option value="51-200" selected={form?.values?.companySize === '51-200'}>51–200</option>
                  <option value="201-1000" selected={form?.values?.companySize === '201-1000'}>201–1,000</option>
                  <option value="1001-5000" selected={form?.values?.companySize === '1001-5000'}>1,001–5,000</option>
                  <option value="5000+" selected={form?.values?.companySize === '5000+'}>5,000+</option>
                </select>
              </label>
              <label class="block sm:col-span-2">
                <span class="text-sm font-medium text-slate-700">WhatsApp number</span>
                <div class="relative mt-1">
                  <span class="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </span>
                  <input name="whatsapp" type="tel" placeholder="+62 812 3456 7890" class="input pl-9" value={form?.values?.whatsapp ?? ''} />
                </div>
                <p class="mt-1 text-xs text-slate-400">Include country code, e.g. +62 for Indonesia</p>
              </label>
            </div>
            {#if form?.error}
              <p class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{form.error}</p>
            {/if}
            <button class="btn-primary w-full py-3 text-base">Reserve my spot →</button>
          </form>
        {/if}
      </div>
    </div>
  </div>

  <!-- Who's attending -->
  {#if data.attendees.length > 0}
    <section class="mt-16 animate-fade-up" style="animation-delay:0.2s">
      <div class="mb-6 flex items-center gap-3">
        <div class="h-px flex-1 bg-slate-200"></div>
        <h2 class="text-xs font-semibold uppercase tracking-widest text-slate-400">Who's attending</h2>
        <div class="h-px flex-1 bg-slate-200"></div>
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        {#each data.attendees as a}
          <div class="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-soft">
            <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
              {(a.company ?? a.role ?? '?')[0].toUpperCase()}
            </div>
            <div class="min-w-0">
              <p class="truncate font-semibold text-slate-900">{a.company ?? ''}</p>
              <p class="truncate text-sm text-slate-500">{a.role ?? 'Executive'}</p>
              {#if a.companySize}
                <span class="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{a.companySize} employees</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Sponsors -->
  {#if data.sponsors.length > 0}
    <section class="mt-16 animate-fade-up" style="animation-delay:0.2s">
      <div class="mb-6 flex items-center gap-3">
        <div class="h-px flex-1 bg-slate-200"></div>
        <h2 class="text-xs font-semibold uppercase tracking-widest text-slate-400">Sponsors</h2>
        <div class="h-px flex-1 bg-slate-200"></div>
      </div>

      {#each tierOrder as t}
        {#if grouped[t.id]?.length}
          <div class="mb-8">
            <p class="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">{t.name}</p>
            <ul class="flex flex-wrap justify-center gap-4">
              {#each grouped[t.id] as s}
                <li class="flex min-w-[140px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift">
                  {#if s.logoAssetId}
                    <img class="mb-2 h-10 w-auto max-w-[120px] object-contain" src={`/files/${s.logoAssetId}`} alt={s.name} />
                  {/if}
                  {#if s.websiteUrl}
                    <a href={s.websiteUrl} rel="noopener noreferrer" target="_blank" class="text-sm font-medium text-slate-700 hover:text-slate-900">{s.name}</a>
                  {:else}
                    <span class="text-sm font-medium text-slate-700">{s.name}</span>
                  {/if}
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      {/each}

      {#if grouped['__none__']?.length}
        <ul class="flex flex-wrap justify-center gap-4">
          {#each grouped['__none__'] as s}
            <li class="flex min-w-[140px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift">
              {#if s.logoAssetId}
                <img class="mb-2 h-10 w-auto max-w-[120px] object-contain" src={`/files/${s.logoAssetId}`} alt={s.name} />
              {/if}
              {#if s.websiteUrl}
                <a href={s.websiteUrl} rel="noopener noreferrer" target="_blank" class="text-sm font-medium text-slate-700 hover:text-slate-900">{s.name}</a>
              {:else}
                <span class="text-sm font-medium text-slate-700">{s.name}</span>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  {/if}
</div>
