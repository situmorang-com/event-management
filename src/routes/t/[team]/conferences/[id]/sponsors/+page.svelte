<script lang="ts">
  let { data } = $props();
  const base = `/t/${data.team.slug}/conferences/${data.conference.id}/sponsors`;
  const tierName = (id: string | null) =>
    id ? data.tiers.find((t) => t.id === id)?.name ?? '—' : '—';

  const STATUSES = ['prospect', 'invited', 'confirmed', 'paid', 'declined'] as const;
  const grouped = STATUSES.map((s) => ({
    status: s,
    items: data.sponsors.filter((x) => x.status === s)
  }));
</script>

<div class="flex items-center justify-between">
  <h2 class="text-lg font-semibold">{data.kind === 'vendor' ? 'Vendors' : 'Sponsors'}</h2>
  <div class="flex gap-2">
    <a class="btn-secondary" href="{base}?kind=sponsor" class:font-bold={data.kind === 'sponsor'}>Sponsors</a>
    <a class="btn-secondary" href="{base}?kind=vendor" class:font-bold={data.kind === 'vendor'}>Vendors</a>
    <a class="btn-secondary" href="{base}/tiers">Tiers</a>
    {#if data.role !== 'staff'}
      <a class="btn-primary" href="{base}/new?kind={data.kind}">New {data.kind}</a>
    {/if}
  </div>
</div>

<div class="mt-6 grid gap-4 md:grid-cols-5">
  {#each grouped as col}
    <div>
      <div class="text-xs uppercase tracking-wide text-slate-500">{col.status} · {col.items.length}</div>
      <ul class="mt-2 space-y-2">
        {#each col.items as s}
          <li>
            <a class="card block hover:bg-slate-50" href="{base}/{s.id}">
              <div class="font-medium">{s.name}</div>
              <div class="text-xs text-slate-500">{tierName(s.tierId)}</div>
              {#if data.seeAmount && s.amount != null}
                <div class="mt-1 text-xs text-slate-700">${(s.amount / 100).toLocaleString()}</div>
              {/if}
            </a>
          </li>
        {/each}
      </ul>
    </div>
  {/each}
</div>
