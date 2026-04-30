<script lang="ts">
  import { page } from '$app/state';
  let { data, form } = $props();
  const c = data.conference;

  const tierMap = new Map(data.tiers.map((t) => [t.id, t]));
  const grouped = data.sponsors.reduce<Record<string, typeof data.sponsors>>((acc, s) => {
    const key = s.tierId ?? '__none__';
    (acc[key] ??= []).push(s);
    return acc;
  }, {});
  const tierOrder = [...data.tiers].sort((a, b) => b.rank - a.rank);

  const ogImage = `${page.url.origin}/e/${c.slug}/og.png`;
  const canonicalUrl = `${page.url.origin}/e/${c.slug}`;
  const dateStr = new Date(c.startsAt).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
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

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content={c.name} />
  <meta property="og:description" content={ogDescription} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={c.name} />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={c.name} />
  <meta name="twitter:description" content={ogDescription} />
  <meta name="twitter:image" content={ogImage} />
</svelte:head>

<article class="mx-auto max-w-2xl">
  <h1 class="text-3xl font-bold">{c.name}</h1>
  <p class="mt-2 text-slate-600">
    {new Date(c.startsAt).toLocaleString()} — {c.venue ?? 'TBA'}
  </p>
  {#if c.description}
    <p class="mt-6 whitespace-pre-wrap">{c.description}</p>
  {/if}

  <section class="card mt-8">
    <h2 class="font-semibold">Register</h2>

    {#if form?.ok}
      <div class="mt-3 rounded bg-green-50 p-4 text-sm text-green-900">
        {form.dedup ? "You're already registered." : "You're in!"} Your ticket:
        <a class="underline" href={`/ticket/${form.ticketCode}`}>view ticket</a>.
        Check your email.
      </div>
    {:else if data.isClosed}
      <p class="mt-3 text-sm text-slate-600">Registration has closed.</p>
    {:else if data.isFull}
      <p class="mt-3 text-sm text-slate-600">This event is sold out.</p>
    {:else}
      {#if c.capacity}
        <p class="mt-1 text-xs text-slate-500">{data.registered} / {c.capacity} registered</p>
      {/if}
      <form method="POST" class="mt-4 space-y-3">
        <label class="block">
          <span class="text-sm font-medium">Name <span class="text-red-500">*</span></span>
          <input name="name" required class="input mt-1" value={form?.values?.name ?? ''} />
        </label>
        <label class="block">
          <span class="text-sm font-medium">Email <span class="text-red-500">*</span></span>
          <input type="email" name="email" required autocomplete="email" class="input mt-1" value={form?.values?.email ?? ''} />
        </label>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="block">
            <span class="text-sm font-medium">Company</span>
            <input name="company" class="input mt-1" value={form?.values?.company ?? ''} />
          </label>
          <label class="block">
            <span class="text-sm font-medium">Role / Title</span>
            <input name="role" class="input mt-1" value={form?.values?.role ?? ''} />
          </label>
        </div>
        <label class="block">
          <span class="text-sm font-medium">WhatsApp number</span>
          <div class="relative mt-1">
            <span class="absolute inset-y-0 left-3 flex items-center text-slate-500">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </span>
            <input
              name="whatsapp"
              type="tel"
              placeholder="+62 812 3456 7890"
              class="input pl-9"
              value={form?.values?.whatsapp ?? ''}
            />
          </div>
          <p class="mt-1 text-xs text-slate-500">Include country code, e.g. +62 for Indonesia</p>
        </label>
        {#if form?.error}
          <p class="text-sm text-red-600">{form.error}</p>
        {/if}
        <button class="btn-primary w-full">Register</button>
      </form>
    {/if}
  </section>

  {#if data.sponsors.length > 0}
    <section class="mt-12">
      <h2 class="text-xl font-semibold">Sponsors</h2>
      {#each tierOrder as t}
        {#if grouped[t.id]?.length}
          <div class="mt-6">
            <div class="text-sm font-medium uppercase tracking-wide text-slate-500">{t.name}</div>
            <ul class="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {#each grouped[t.id] as s}
                <li class="card text-center">
                  {#if s.logoAssetId}
                    <img class="mx-auto h-12 object-contain" src={`/files/${s.logoAssetId}`} alt={s.name} />
                  {/if}
                  <div class="mt-2 text-sm">
                    {#if s.websiteUrl}
                      <a href={s.websiteUrl} rel="noopener noreferrer" target="_blank">{s.name}</a>
                    {:else}{s.name}{/if}
                  </div>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      {/each}
      {#if grouped['__none__']?.length}
        <ul class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {#each grouped['__none__'] as s}
            <li class="card text-center">
              {#if s.websiteUrl}
                <a href={s.websiteUrl} rel="noopener noreferrer" target="_blank">{s.name}</a>
              {:else}{s.name}{/if}
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  {/if}
</article>
