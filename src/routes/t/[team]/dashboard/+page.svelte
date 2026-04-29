<script lang="ts">
  let { data } = $props();
</script>

<h1 class="text-2xl font-semibold">{data.team.name}</h1>
<p class="mt-2 text-slate-600">Team dashboard. Stats coming soon.</p>
<div class="mt-6">
  <a href="/t/{data.team.slug}/conferences/new" class="btn-primary">New conference</a>
</div>
