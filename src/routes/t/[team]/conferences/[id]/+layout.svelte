<script lang="ts">
  let { children, data } = $props();
  const base = $derived(`/t/${data.team.slug}/conferences/${data.conference.id}`);
</script>

<div>
  <div class="flex items-baseline justify-between">
    <h1 class="text-2xl font-semibold">{data.conference.name}</h1>
    <span class="rounded-full bg-slate-200 px-2 py-0.5 text-xs">{data.conference.status}</span>
  </div>

  <nav class="mt-4 flex gap-2 border-b border-slate-200 text-sm">
    {#each [
      { href: base, label: 'Overview' },
      { href: `${base}/guests`, label: 'Guests' },
      { href: `${base}/checkin`, label: 'Check-in' },
      { href: `${base}/sponsors`, label: 'Sponsors' },
      { href: `${base}/settings`, label: 'Settings' }
    ] as t}
      <a class="border-b-2 border-transparent px-3 py-2 hover:border-slate-300" href={t.href}>{t.label}</a>
    {/each}
  </nav>

  <div class="mt-6">{@render children()}</div>
</div>
