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
      <label class="block">
        <span class="text-xs">Contact WhatsApp</span>
        <div class="relative mt-1">
          <span class="absolute inset-y-0 left-3 flex items-center">
            <svg class="h-3.5 w-3.5 text-slate-400" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </span>
          <input
            type="tel"
            name="contactWhatsapp"
            placeholder="+62 812 3456 7890"
            class="input pl-8"
            value={s.contactWhatsapp ?? ''}
            disabled={!data.canEdit}
          />
        </div>
        {#if s.contactWhatsapp}
          <a
            href={`https://wa.me/${s.contactWhatsapp.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Hi! Regarding your sponsorship of ${data.conference?.name ?? 'our event'}…`)}`}
            target="_blank"
            rel="noopener noreferrer"
            class="mt-1 inline-flex items-center gap-1 text-xs text-green-700 hover:underline"
          >Open chat ↗</a>
        {/if}
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
        <form method="POST" action="?/uploadLogo" enctype="multipart/form-data" class="mt-2 space-y-2">
          <input type="file" name="file" accept="image/png,image/jpeg,image/webp" required class="input" />
          <button class="btn-secondary w-full">Upload</button>
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
        <form method="POST" action="?/uploadContract" enctype="multipart/form-data" class="mt-2 space-y-2">
          <input type="file" name="file" accept="application/pdf" required class="input" />
          <button class="btn-secondary w-full">Upload PDF</button>
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
