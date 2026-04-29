<script lang="ts">
  let { data } = $props();
</script>

<h1 class="text-2xl font-semibold">Choose a team</h1>
<ul class="mt-6 space-y-2">
  {#each data.memberships as m}
    <li>
      <a class="card block hover:bg-slate-50" href="/t/{m.teamSlug}/dashboard">
        <div class="font-medium">{m.teamName}</div>
        <div class="text-sm text-slate-500">{m.role}</div>
      </a>
    </li>
  {/each}
</ul>
<p class="mt-6">
  <a href="/teams/new" class="btn-secondary">Create new team</a>
</p>
