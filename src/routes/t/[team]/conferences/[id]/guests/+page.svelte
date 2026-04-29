<script lang="ts">
  let { data, form } = $props();
  let showAdd = $state(false);
  const csvHref = `/t/${data.team.slug}/conferences/${data.conference.id}/guests/export.csv`;
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
      <span class="text-sm font-medium">Name</span>
      <input name="name" required class="input mt-1" />
    </label>
    <label class="block">
      <span class="text-sm font-medium">Email</span>
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
    <label class="flex items-center gap-2 text-sm sm:col-span-2">
      <input type="checkbox" name="sendEmail" />
      Send ticket email now
    </label>
    {#if form?.error}
      <p class="text-sm text-red-600 sm:col-span-2">{form.error}</p>
    {/if}
    <button class="btn-primary sm:col-span-2">Add</button>
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
        <th class="px-4 py-2"></th>
      </tr>
    </thead>
    <tbody>
      {#each data.guests as g}
        <tr class="border-t border-slate-100">
          <td class="px-4 py-2">{g.name}</td>
          <td class="px-4 py-2">{g.email}</td>
          <td class="px-4 py-2 text-slate-500">{g.company ?? ''}</td>
          <td class="px-4 py-2">
            <span class="rounded bg-slate-100 px-2 py-0.5 text-xs">{g.status}</span>
          </td>
          <td class="px-4 py-2 text-slate-500">
            {new Date(g.registeredAt).toLocaleDateString()}
          </td>
          <td class="px-4 py-2 text-right">
            <a class="text-xs underline" href={`/ticket/${g.ticketCode}`} target="_blank">ticket</a>
            {#if data.role !== 'staff' && g.status !== 'cancelled'}
              <form method="POST" action="?/cancel" class="ml-2 inline">
                <input type="hidden" name="id" value={g.id} />
                <button class="text-xs text-red-600 underline">cancel</button>
              </form>
            {/if}
          </td>
        </tr>
      {:else}
        <tr><td colspan="6" class="px-4 py-8 text-center text-slate-500">No guests yet.</td></tr>
      {/each}
    </tbody>
  </table>
</div>
