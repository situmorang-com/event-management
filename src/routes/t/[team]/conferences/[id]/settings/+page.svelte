<script lang="ts">
  let { data, form } = $props();
  const c = data.conference;
  const fmt = (d: Date) => {
    const dt = new Date(d);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  };
</script>

<h2 class="text-lg font-semibold">Settings</h2>

{#if form?.saved}
  <p class="mt-3 rounded bg-green-50 p-3 text-sm text-green-900">Saved.</p>
{/if}
{#if form?.error}
  <p class="mt-3 rounded bg-red-50 p-3 text-sm text-red-900">{form.error}</p>
{/if}

<form method="POST" action="?/edit" class="card mt-6 space-y-4">
  <h3 class="font-medium">Details</h3>
  <label class="block">
    <span class="text-sm font-medium">Name</span>
    <input name="name" required class="input mt-1" value={c.name} />
  </label>
  <label class="block">
    <span class="text-sm font-medium">Venue</span>
    <input name="venue" class="input mt-1" value={c.venue ?? ''} />
  </label>
  <div class="grid gap-4 sm:grid-cols-2">
    <label class="block">
      <span class="text-sm font-medium">Starts at</span>
      <input type="datetime-local" name="startsAt" required class="input mt-1" value={fmt(c.startsAt)} />
    </label>
    <label class="block">
      <span class="text-sm font-medium">Ends at</span>
      <input type="datetime-local" name="endsAt" required class="input mt-1" value={fmt(c.endsAt)} />
    </label>
  </div>
  <label class="block">
    <span class="text-sm font-medium">Capacity</span>
    <input type="number" name="capacity" min="1" class="input mt-1" value={c.capacity ?? ''} />
  </label>
  <label class="block">
    <span class="text-sm font-medium">Description</span>
    <textarea name="description" rows="4" class="input mt-1">{c.description ?? ''}</textarea>
  </label>
  <button class="btn-primary">Save</button>
</form>

<form method="POST" action="?/status" class="card mt-6">
  <h3 class="font-medium">Status</h3>
  <p class="mt-1 text-sm text-slate-600">
    Current: <strong>{c.status}</strong>. Only <code>published</code> conferences are visible at <code>/e/{c.slug}</code>.
  </p>
  <div class="mt-3 flex gap-2">
    {#each ['draft', 'published', 'closed', 'archived'] as s}
      <button name="status" value={s} class="btn-secondary" disabled={s === c.status}>{s}</button>
    {/each}
  </div>
</form>
