<script lang="ts">
  let { data, form } = $props();
  const isOwner = data.role === 'owner';
</script>

<h1 class="text-2xl font-semibold">Members</h1>

{#if form?.invited}<p class="mt-3 text-sm text-green-700">Invitation sent.</p>{/if}
{#if form?.error}<p class="mt-3 text-sm text-red-600">{form.error}</p>{/if}

{#if isOwner}
  <form method="POST" action="?/invite" class="card mt-4 grid gap-2 sm:grid-cols-[1fr_140px_auto]">
    <input type="email" name="email" placeholder="email@example.com" required class="input" />
    <select name="role" class="input">
      <option value="admin">admin</option>
      <option value="staff">staff</option>
    </select>
    <button class="btn-primary">Invite</button>
  </form>
{/if}

<div class="card mt-6 overflow-hidden p-0">
  <table class="w-full text-sm">
    <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
      <tr>
        <th class="px-4 py-2">Email</th>
        <th class="px-4 py-2">Role</th>
        <th class="px-4 py-2">Joined</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each data.members as m}
        <tr class="border-t border-slate-100">
          <td class="px-4 py-2">{m.email}</td>
          <td class="px-4 py-2">
            {#if isOwner}
              <form method="POST" action="?/setRole" class="inline">
                <input type="hidden" name="id" value={m.id} />
                <select name="role" class="input py-1" onchange={(e) => e.currentTarget.form?.requestSubmit()}>
                  {#each ['owner', 'admin', 'staff'] as r}
                    <option value={r} selected={m.role === r}>{r}</option>
                  {/each}
                </select>
              </form>
            {:else}
              {m.role}
            {/if}
          </td>
          <td class="px-4 py-2 text-slate-500">{new Date(m.joinedAt).toLocaleDateString()}</td>
          <td class="px-4 py-2 text-right">
            {#if isOwner}
              <form method="POST" action="?/removeMember" class="inline">
                <input type="hidden" name="id" value={m.id} />
                <button class="text-xs text-red-600 underline">remove</button>
              </form>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

{#if data.pending.length > 0}
  <h2 class="mt-8 text-lg font-semibold">Pending invitations</h2>
  <ul class="mt-3 space-y-2">
    {#each data.pending as inv}
      <li class="card flex items-center justify-between">
        <div>
          <div class="font-medium">{inv.email}</div>
          <div class="text-xs text-slate-500">
            {inv.role} · expires {new Date(inv.expiresAt).toLocaleDateString()}
          </div>
        </div>
        {#if isOwner}
          <form method="POST" action="?/cancelInvite">
            <input type="hidden" name="id" value={inv.id} />
            <button class="text-xs text-red-600 underline">cancel</button>
          </form>
        {/if}
      </li>
    {/each}
  </ul>
{/if}
