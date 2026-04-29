<script lang="ts">
  let { data } = $props();
</script>

<div class="flex items-center justify-between">
  <h1 class="text-2xl font-semibold">Conferences</h1>
  <a class="btn-primary" href="/t/{data.team.slug}/conferences/new">New conference</a>
</div>

{#if data.conferences.length === 0}
  <div class="card mt-6 text-center text-slate-600">No conferences yet.</div>
{:else}
  <ul class="mt-6 space-y-2">
    {#each data.conferences as c}
      <li>
        <a class="card block hover:bg-slate-50" href="/t/{data.team.slug}/conferences/{c.id}">
          <div class="font-medium">{c.name}</div>
          <div class="text-sm text-slate-500">
            {new Date(c.startsAt).toLocaleDateString()} · {c.status}
          </div>
        </a>
      </li>
    {/each}
  </ul>
{/if}
