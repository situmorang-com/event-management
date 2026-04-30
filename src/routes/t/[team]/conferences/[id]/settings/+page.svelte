<script lang="ts">
  import { page } from '$app/state';
  let { data, form } = $props();
  const c = data.conference;

  const fmt = (d: Date) => {
    const dt = new Date(d);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  };

  const publicUrl = `${page.url.origin}/e/${c.slug}`;
  let copied = $state(false);

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  async function shareLink() {
    if (navigator.share) {
      await navigator.share({ title: c.name, url: publicUrl });
    } else {
      await copyLink();
    }
  }
</script>

<h2 class="text-lg font-semibold">Settings</h2>

{#if form?.saved}
  <p class="mt-3 rounded bg-green-50 p-3 text-sm text-green-900">Saved.</p>
{/if}
{#if form?.error}
  <p class="mt-3 rounded bg-red-50 p-3 text-sm text-red-900">{form.error}</p>
{/if}

<!-- ── Public link card ── -->
{#if c.status === 'published'}
  <div class="card mt-6 border-green-200 bg-green-50">
    <div class="flex items-center gap-2">
      <span class="h-2 w-2 rounded-full bg-green-500"></span>
      <h3 class="font-medium text-green-900">Live — accepting registrations</h3>
    </div>
    <p class="mt-3 text-xs font-medium uppercase tracking-wide text-green-700">Public registration link</p>
    <div class="mt-1 flex items-center gap-2">
      <a
        href={publicUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="min-w-0 flex-1 truncate rounded-md border border-green-300 bg-white px-3 py-2 font-mono text-sm text-slate-800 hover:underline"
      >{publicUrl}</a>
      <button
        onclick={copyLink}
        class="btn-secondary shrink-0 gap-1.5"
        title="Copy link"
      >
        {#if copied}
          <svg class="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          Copied!
        {:else}
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z"/>
            <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"/>
          </svg>
          Copy
        {/if}
      </button>
      <button
        onclick={shareLink}
        class="btn-primary shrink-0 gap-1.5"
        title="Share"
      >
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
        </svg>
        Share
      </button>
    </div>
    <p class="mt-2 text-xs text-green-700">Share this link with attendees so they can register.</p>
  </div>
{/if}

<!-- ── Details form ── -->
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

<!-- ── Status form ── -->
<form method="POST" action="?/status" class="card mt-6">
  <h3 class="font-medium">Status</h3>
  <p class="mt-1 text-sm text-slate-600">
    Current: <strong>{c.status}</strong>.
    {#if c.status !== 'published'}
      Set to <strong>published</strong> to make the registration page live.
    {/if}
  </p>
  <div class="mt-3 flex flex-wrap gap-2">
    {#each ['draft', 'published', 'closed', 'archived'] as s}
      <button
        name="status"
        value={s}
        class="btn-secondary {s === c.status ? 'ring-2 ring-slate-900' : ''}"
        disabled={s === c.status}
      >{s}</button>
    {/each}
  </div>
</form>
