<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();

  let showAdd = $state(false);
  let dragging = $state(false);
  let dropFileName = $state<string | null>(null);
  let importing = $state(false);
  let fileInput = $state<HTMLInputElement | null>(null);
  let importForm = $state<HTMLFormElement | null>(null);

  const csvHref = `/t/${data.team.slug}/conferences/${data.conference.id}/guests/export.csv`;

  function waLink(number: string | null, name: string, ticketCode: string) {
    if (!number) return null;
    const normalized = number.replace(/[^\d]/g, '');
    const ticketUrl = `${window.location.origin}/ticket/${ticketCode}`;
    const msg = encodeURIComponent(
      `Hi ${name}! 👋 You're registered for *${data.conference.name}*.\n\nYour ticket: ${ticketUrl}\n\nSee you there! 🎉`
    );
    return `https://wa.me/${normalized}?text=${msg}`;
  }

  function onDragOver(e: DragEvent) { e.preventDefault(); dragging = true; }
  function onDragLeave(e: DragEvent) {
    // only clear if leaving the zone itself (not a child)
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) dragging = false;
  }
  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragging = false;
    const file = e.dataTransfer?.files[0];
    if (file && fileInput) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInput.files = dt.files;
      dropFileName = file.name;
    }
  }
  function onFileChange(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    dropFileName = f?.name ?? null;
  }
  function clearDrop() {
    dropFileName = null;
    if (fileInput) { fileInput.value = ''; }
  }
</script>

<!-- ── Header ── -->
<div class="flex items-center justify-between">
  <h2 class="text-lg font-semibold">Guests · {data.guests.length}</h2>
  <div class="flex gap-2">
    <a href={csvHref} class="btn-secondary">Export CSV</a>
    {#if data.role !== 'staff'}
      <button class="btn-primary" onclick={() => { showAdd = !showAdd; }}>
        {showAdd ? 'Close' : 'Add guest'}
      </button>
    {/if}
  </div>
</div>

<!-- ── Import result banner ── -->
{#if form?.imported != null}
  <div class="mt-3 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900">
    ✓ Imported <strong>{form.imported}</strong> contacts
    {#if form.skipped} · {form.skipped} skipped (duplicates or invalid){/if}
    {#if form.importErrors?.length}
      <ul class="mt-1 list-disc pl-4 text-xs text-green-800">
        {#each form.importErrors as e}<li>{e}</li>{/each}
      </ul>
    {/if}
  </div>
{/if}
{#if form?.importError}
  <p class="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
    {form.importError}
  </p>
{/if}

<!-- ── Drop zone ── -->
{#if data.role !== 'staff'}
  <form
    method="POST"
    action="?/import"
    enctype="multipart/form-data"
    bind:this={importForm}
    use:enhance={() => {
      importing = true;
      return async ({ update }) => { await update(); importing = false; clearDrop(); };
    }}
  >
    <div
      role="region"
      aria-label="Drop CSV file to import contacts"
      class="mt-4 rounded-lg border-2 border-dashed transition-all duration-150
        {dragging ? 'border-slate-800 bg-slate-100 scale-[1.01]' : 'border-slate-300 bg-slate-50'}
        {dropFileName ? 'border-green-400 bg-green-50' : ''}"
      ondragover={onDragOver}
      ondragleave={onDragLeave}
      ondrop={onDrop}
    >
      {#if !dropFileName}
        <!-- Empty state: click or drag -->
        <button
          type="button"
          class="flex w-full flex-col items-center gap-2 px-6 py-8 text-center"
          onclick={() => fileInput?.click()}
        >
          <svg class="h-10 w-10 text-slate-400 transition-colors {dragging ? 'text-slate-600' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/>
          </svg>
          <span class="text-sm font-medium text-slate-700">
            {dragging ? 'Drop to import' : 'Drop CSV or vCard (.vcf) here'}
          </span>
          <span class="text-xs text-slate-500">
            or click to browse &nbsp;·&nbsp; CSV columns: <code class="rounded bg-slate-200 px-1">name</code> <code class="rounded bg-slate-200 px-1">email</code> <code class="rounded bg-slate-200 px-1">whatsapp</code> <code class="rounded bg-slate-200 px-1">company</code> <code class="rounded bg-slate-200 px-1">role</code> &nbsp;·&nbsp; vCard from macOS Contacts works too
          </span>
        </button>
      {:else}
        <!-- File selected: show name + actions -->
        <div class="flex items-center gap-4 px-6 py-4">
          <svg class="h-8 w-8 shrink-0 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
          </svg>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-slate-900">{dropFileName}</p>
            <p class="text-xs text-slate-500">Ready to import</p>
          </div>
          <button type="button" class="btn-secondary" onclick={clearDrop}>Remove</button>
          <button type="submit" class="btn-primary" disabled={importing}>
            {importing ? 'Importing…' : 'Import contacts'}
          </button>
        </div>
      {/if}
    </div>
    <!-- Hidden file input — used for both click-browse and drag-drop -->
    <input
      type="file"
      name="file"
      accept=".csv,text/csv,.vcf,text/vcard,text/x-vcard"
      class="hidden"
      bind:this={fileInput}
      onchange={onFileChange}
    />
  </form>
{/if}

<!-- ── Add guest inline form ── -->
{#if showAdd}
  <form method="POST" action="?/add" class="card mt-4 grid gap-3 sm:grid-cols-2">
    <label class="block">
      <span class="text-sm font-medium">Name <span class="text-red-500">*</span></span>
      <input name="name" required class="input mt-1" />
    </label>
    <label class="block">
      <span class="text-sm font-medium">Email <span class="text-red-500">*</span></span>
      <input type="email" name="email" required class="input mt-1" />
    </label>
    <label class="block">
      <span class="text-sm font-medium">Company</span>
      <input name="company" class="input mt-1" />
    </label>
    <label class="block">
      <span class="text-sm font-medium">Role</span>
      <input name="role" class="input mt-1" />
    </label>
    <label class="block sm:col-span-2">
      <span class="text-sm font-medium">WhatsApp number</span>
      <div class="relative mt-1">
        <span class="absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-slate-400">WA</span>
        <input type="tel" name="whatsapp" placeholder="+62 812 3456 7890" class="input pl-10" />
      </div>
    </label>
    <label class="flex items-center gap-2 text-sm sm:col-span-2">
      <input type="checkbox" name="sendEmail" /> Send ticket confirmation email
    </label>
    {#if form?.error}
      <p class="text-sm text-red-600 sm:col-span-2">{form.error}</p>
    {/if}
    <button class="btn-primary sm:col-span-2">Add guest</button>
  </form>
{/if}

<!-- ── Search / filter ── -->
<form method="GET" class="mt-4 flex gap-2">
  <input name="q" placeholder="Search name, email, company" class="input flex-1" value={data.q} />
  <select name="status" class="input w-40">
    <option value="">All statuses</option>
    {#each ['registered', 'confirmed', 'checked_in', 'cancelled'] as s}
      <option value={s} selected={data.status === s}>{s}</option>
    {/each}
  </select>
  <button class="btn-secondary">Filter</button>
</form>

<!-- ── Table ── -->
<div class="card mt-4 overflow-hidden p-0">
  <table class="w-full text-sm">
    <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
      <tr>
        <th class="px-4 py-2">Name</th>
        <th class="px-4 py-2">Company</th>
        <th class="px-4 py-2">Role</th>
        <th class="px-4 py-2">Status</th>
        <th class="px-4 py-2">Registered</th>
        <th class="px-4 py-2">Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each data.guests as g}
        <tr class="border-t border-slate-100">
          <td class="px-4 py-2 font-medium">{g.name}</td>
          <td class="px-4 py-2 text-slate-500">{g.company ?? '—'}</td>
          <td class="px-4 py-2 text-slate-500">{g.role ?? '—'}</td>
          <td class="px-4 py-2">
            <span class="rounded bg-slate-100 px-2 py-0.5 text-xs">{g.status}</span>
          </td>
          <td class="px-4 py-2 text-slate-500">
            {new Date(g.registeredAt).toLocaleDateString()}
          </td>
          <td class="px-4 py-2">
            <div class="flex items-center gap-2">
              <a class="text-xs underline" href={`mailto:${g.email}`} title={g.email}>email</a>
              <a class="text-xs underline" href={`/ticket/${g.ticketCode}`} target="_blank">ticket</a>
              {#if g.whatsapp}
                {@const link = waLink(g.whatsapp, g.name, g.ticketCode)}
                {#if link}
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs text-green-800 hover:bg-green-200"
                    title={g.whatsapp}
                  >
                    <svg class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WA
                  </a>
                {/if}
              {/if}
              {#if data.role !== 'staff' && g.status !== 'cancelled'}
                <form method="POST" action="?/cancel" class="inline">
                  <input type="hidden" name="id" value={g.id} />
                  <button class="text-xs text-red-600 underline">cancel</button>
                </form>
              {/if}
            </div>
          </td>
        </tr>
      {:else}
        <tr>
          <td colspan="6" class="px-4 py-8 text-center text-slate-500">No guests yet.</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
