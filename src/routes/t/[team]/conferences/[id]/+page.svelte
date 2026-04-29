<script lang="ts">
  let { data } = $props();
  const c = data.conference;
  const s = data.stats;
  const pct = c.capacity ? Math.min(100, Math.round((s.registered / c.capacity) * 100)) : null;
</script>

<div class="grid gap-4 md:grid-cols-4">
  <div class="card">
    <div class="text-sm text-slate-500">Registered</div>
    <div class="mt-1 text-3xl font-semibold">{s.registered}</div>
    {#if c.capacity}
      <div class="mt-2 h-2 w-full overflow-hidden rounded bg-slate-100">
        <div class="h-full bg-slate-900" style="width: {pct}%"></div>
      </div>
      <div class="mt-1 text-xs text-slate-500">{s.registered} / {c.capacity}</div>
    {/if}
  </div>
  <div class="card">
    <div class="text-sm text-slate-500">Checked in</div>
    <div class="mt-1 text-3xl font-semibold">{s.checkedIn}</div>
  </div>
  <div class="card">
    <div class="text-sm text-slate-500">Sponsors</div>
    <div class="mt-1 text-3xl font-semibold">{s.sponsors}</div>
  </div>
  {#if s.totalRaised !== null}
    <div class="card">
      <div class="text-sm text-slate-500">Sponsorship raised</div>
      <div class="mt-1 text-3xl font-semibold">
        ${(s.totalRaised / 100).toLocaleString()}
      </div>
    </div>
  {/if}
</div>

<div class="card mt-6">
  <h2 class="font-semibold">Public registration</h2>
  <p class="mt-1 text-sm text-slate-600">
    {#if c.status === 'published'}
      Share this URL: <a class="underline" href="/e/{c.slug}">/e/{c.slug}</a>
    {:else}
      Conference is <strong>{c.status}</strong>. Publish it from
      <a class="underline" href="/t/{data.team.slug}/conferences/{c.id}/settings">settings</a>.
    {/if}
  </p>
</div>
