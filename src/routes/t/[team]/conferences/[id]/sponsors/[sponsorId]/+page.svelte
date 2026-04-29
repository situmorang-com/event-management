<script lang="ts">
  let { data, form } = $props();
  const s = data.sponsor;
</script>

<div class="flex items-center justify-between">
  <h2 class="text-lg font-semibold">{s.name}</h2>
  <a href="../?kind={s.kind}" class="btn-secondary">Back</a>
</div>

{#if form?.saved}<p class="mt-3 text-sm text-green-700">Saved.</p>{/if}
{#if form?.uploaded}<p class="mt-3 text-sm text-green-700">Uploaded.</p>{/if}
{#if form?.error}<p class="mt-3 text-sm text-red-600">{form.error}</p>{/if}

<div class="mt-4 grid gap-4 md:grid-cols-3">
  <div class="card md:col-span-2">
    <h3 class="font-medium">Details</h3>
    <form method="POST" action="?/update" class="mt-3 grid gap-3 sm:grid-cols-2">
      <label class="block sm:col-span-2">
        <span class="text-xs">Name</span>
        <input name="name" required class="input mt-1" value={s.name} disabled={!data.canEdit} />
      </label>
      <label class="block">
        <span class="text-xs">Website</span>
        <input type="url" name="websiteUrl" class="input mt-1" value={s.websiteUrl ?? ''} disabled={!data.canEdit} />
      </label>
      <label class="block">
        <span class="text-xs">Tier</span>
        <select name="tierId" class="input mt-1" disabled={!data.canEdit}>
          <option value="">— none —</option>
          {#each data.tiers as t}
            <option value={t.id} selected={t.id === s.tierId}>{t.name}</option>
          {/each}
        </select>
      </label>
      <label class="block">
        <span class="text-xs">Status</span>
        <select name="status" class="input mt-1" disabled={!data.canEdit}>
          {#each ['prospect', 'invited', 'confirmed', 'paid', 'declined'] as st}
            <option value={st} selected={st === s.status}>{st}</option>
          {/each}
        </select>
      </label>
      <label class="block">
        <span class="text-xs">Amount ($)</span>
        <input
          type="number"
          step="0.01"
          min="0"
          name="amount"
          class="input mt-1"
          value={s.amount != null ? (s.amount / 100).toFixed(2) : ''}
          disabled={!data.canEdit}
        />
      </label>
      <label class="block">
        <span class="text-xs">Contact name</span>
        <input name="contactName" class="input mt-1" value={s.contactName ?? ''} disabled={!data.canEdit} />
      </label>
      <label class="block">
        <span class="text-xs">Contact email</span>
        <input type="email" name="contactEmail" class="input mt-1" value={s.contactEmail ?? ''} disabled={!data.canEdit} />
      </label>
      <label class="block">
        <span class="text-xs">Contact phone</span>
        <input name="contactPhone" class="input mt-1" value={s.contactPhone ?? ''} disabled={!data.canEdit} />
      </label>
      <label class="block sm:col-span-2">
        <span class="text-xs">Description (public)</span>
        <textarea name="description" rows="3" class="input mt-1" disabled={!data.canEdit}>{s.description ?? ''}</textarea>
      </label>
      <label class="block sm:col-span-2">
        <span class="text-xs">Internal notes</span>
        <textarea name="notes" rows="3" class="input mt-1" disabled={!data.canEdit}>{s.notes ?? ''}</textarea>
      </label>
      <label class="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" name="isPublic" checked={s.isPublic} disabled={!data.canEdit} />
        Show on public sponsor wall
      </label>
      {#if data.canEdit}
        <div class="flex gap-2 sm:col-span-2">
          <button class="btn-primary">Save</button>
          <button
            formaction="?/delete"
            class="btn-secondary text-red-600"
            onclick={(e) => { if (!confirm('Delete sponsor?')) e.preventDefault(); }}
          >Delete</button>
        </div>
      {/if}
    </form>
  </div>

  <div class="space-y-4">
    <div class="card">
      <h3 class="font-medium">Logo</h3>
      {#if s.logoAssetId}
        <img class="mt-2 max-h-24" src={`/files/${s.logoAssetId}`} alt={s.name} />
      {:else}
        <p class="mt-2 text-sm text-slate-500">No logo uploaded.</p>
      {/if}
      {#if data.canEdit}
        <form method="POST" action="?/uploadLogo" enctype="multipart/form-data" class="mt-2">
          <input type="file" name="file" accept="image/png,image/jpeg,image/webp" required class="text-sm" />
          <button class="btn-secondary mt-2">Upload</button>
        </form>
      {/if}
    </div>

    {#if 'contractAssetId' in s && data.canEdit}
      <div class="card">
        <h3 class="font-medium">Contract</h3>
        {#if s.contractAssetId}
          <a class="mt-2 block text-sm underline" href={`/files/${s.contractAssetId}`}>View contract</a>
        {:else}
          <p class="mt-2 text-sm text-slate-500">No contract uploaded.</p>
        {/if}
        <form method="POST" action="?/uploadContract" enctype="multipart/form-data" class="mt-2">
          <input type="file" name="file" accept="application/pdf" required class="text-sm" />
          <button class="btn-secondary mt-2">Upload PDF</button>
        </form>
      </div>
    {/if}
  </div>
</div>

<div class="card mt-4">
  <h3 class="font-medium">Deliverables</h3>
  {#if data.canEdit}
    <form method="POST" action="?/addDeliverable" class="mt-3 grid gap-2 sm:grid-cols-[1fr_180px_auto]">
      <input name="title" required placeholder="e.g. Send logo" class="input" />
      <input type="date" name="dueDate" class="input" />
      <button class="btn-secondary">Add</button>
    </form>
  {/if}
  <ul class="mt-3 space-y-1">
    {#each data.deliverables as d}
      <li class="flex items-center gap-3 text-sm">
        <form method="POST" action="?/toggleDeliverable">
          <input type="hidden" name="id" value={d.id} />
          <input type="hidden" name="done" value={d.doneAt ? 'false' : 'true'} />
          <button class="text-lg" aria-label="toggle">
            {d.doneAt ? '☑' : '☐'}
          </button>
        </form>
        <span class:line-through={d.doneAt} class="flex-1">{d.title}</span>
        {#if d.dueDate}
          <span class="text-xs text-slate-500">{new Date(d.dueDate).toLocaleDateString()}</span>
        {/if}
        {#if data.canEdit}
          <form method="POST" action="?/deleteDeliverable">
            <input type="hidden" name="id" value={d.id} />
            <button class="text-xs text-red-600 underline">delete</button>
          </form>
        {/if}
      </li>
    {:else}
      <li class="text-sm text-slate-500">No deliverables.</li>
    {/each}
  </ul>
</div>
