<script lang="ts">
  let { data, form } = $props();
  const c = data.conference;

  // Group sponsors by tier (by rank ascending = top tier first if ranks are reversed; we sort by tier rank desc for visual hierarchy)
  const tierMap = new Map(data.tiers.map((t) => [t.id, t]));
  const grouped = data.sponsors.reduce<Record<string, typeof data.sponsors>>((acc, s) => {
    const key = s.tierId ?? '__none__';
    (acc[key] ??= []).push(s);
    return acc;
  }, {});
  const tierOrder = [...data.tiers].sort((a, b) => b.rank - a.rank);
</script>

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
        <p class="mt-1 text-xs text-slate-500">
          {data.registered} / {c.capacity} registered
        </p>
      {/if}
      <form method="POST" class="mt-4 space-y-3">
        <label class="block">
          <span class="text-sm font-medium">Name</span>
          <input name="name" required class="input mt-1" value={form?.values?.name ?? ''} />
        </label>
        <label class="block">
          <span class="text-sm font-medium">Email</span>
          <input
            type="email"
            name="email"
            required
            autocomplete="email"
            class="input mt-1"
            value={form?.values?.email ?? ''}
          />
        </label>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="block">
            <span class="text-sm font-medium">Company</span>
            <input name="company" class="input mt-1" value={form?.values?.company ?? ''} />
          </label>
          <label class="block">
            <span class="text-sm font-medium">Role</span>
            <input name="role" class="input mt-1" value={form?.values?.role ?? ''} />
          </label>
        </div>
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
                    <img class="mx-auto h-12" src={`/files/${s.logoAssetId}`} alt={s.name} />
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
