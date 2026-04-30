<script lang="ts">
  let { data, form } = $props();
  let showAdd = $state(false);
  const csvHref = `/t/${data.team.slug}/conferences/${data.conference.id}/guests/export.csv`;

  function waLink(number: string | null, name: string, ticketCode: string) {
    if (!number) return null;
    const normalized = number.replace(/[^\d+]/g, '').replace(/^\+/, '');
    const ticketUrl = `${window.location.origin}/ticket/${ticketCode}`;
    const msg = encodeURIComponent(
      `Hi ${name}! 👋 You're registered for *${data.conference.name}*.\n\nYour ticket: ${ticketUrl}\n\nSee you there! 🎉`
    );
    return `https://wa.me/${normalized}?text=${msg}`;
  }
</script>

<div class="flex items-center justify-between">
  <h2 class="text-lg font-semibold">Guests · {data.guests.length}</h2>
  <div class="flex gap-2">
    <a href={csvHref} class="btn-secondary">Export CSV</a>
    {#if data.role !== 'staff'}
      <button class="btn-primary" onclick={() => (showAdd = !showAdd)}>
        {showAdd ? 'Close' : 'Add guest'}
      </button>
    {/if}
  </div>
</div>

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
        <span class="absolute inset-y-0 left-3 flex items-center text-slate-400 text-xs font-semibold">WA</span>
        <input type="tel" name="whatsapp" placeholder="+62 812 3456 7890" class="input pl-10" />
      </div>
    </label>
    <label class="flex items-center gap-2 text-sm sm:col-span-2">
      <input type="checkbox" name="sendEmail" />
      Send ticket confirmation email
    </label>
    {#if form?.error}
      <p class="text-sm text-red-600 sm:col-span-2">{form.error}</p>
    {/if}
    <button class="btn-primary sm:col-span-2">Add guest</button>
  </form>
{/if}

<form method="GET" class="mt-4 flex gap-2">
  <input
    name="q"
    placeholder="Search name, email, company"
    class="input flex-1"
    value={data.q}
  />
  <select name="status" class="input w-40">
    <option value="">All statuses</option>
    {#each ['registered', 'confirmed', 'checked_in', 'cancelled'] as s}
      <option value={s} selected={data.status === s}>{s}</option>
    {/each}
  </select>
  <button class="btn-secondary">Filter</button>
</form>

<div class="card mt-4 overflow-hidden p-0">
  <table class="w-full text-sm">
    <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
      <tr>
        <th class="px-4 py-2">Name</th>
        <th class="px-4 py-2">Email</th>
        <th class="px-4 py-2">Company</th>
        <th class="px-4 py-2">Status</th>
        <th class="px-4 py-2">Registered</th>
        <th class="px-4 py-2">Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each data.guests as g}
        <tr class="border-t border-slate-100">
          <td class="px-4 py-2 font-medium">{g.name}</td>
          <td class="px-4 py-2 text-slate-600">{g.email}</td>
          <td class="px-4 py-2 text-slate-500">{g.company ?? '—'}</td>
          <td class="px-4 py-2">
            <span class="rounded bg-slate-100 px-2 py-0.5 text-xs">{g.status}</span>
          </td>
          <td class="px-4 py-2 text-slate-500">
            {new Date(g.registeredAt).toLocaleDateString()}
          </td>
          <td class="px-4 py-2">
            <div class="flex items-center gap-2">
              <a
                class="text-xs underline"
                href={`/ticket/${g.ticketCode}`}
                target="_blank"
              >ticket</a>

              {#if g.whatsapp}
                {@const link = waLink(g.whatsapp, g.name, g.ticketCode)}
                {#if link}
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs text-green-800 hover:bg-green-200"
                    title="Send WhatsApp invite to {g.whatsapp}"
                  >
                    <svg class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
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
