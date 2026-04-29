<script lang="ts">
  import { page } from '$app/state';
  let { children, data } = $props();
</script>

<div class="grid gap-8 md:grid-cols-[200px_1fr]">
  <aside>
    <div class="text-xs uppercase tracking-wide text-slate-500">Team</div>
    <div class="font-semibold">{data.team.name}</div>
    <div class="mt-1 text-xs text-slate-500">{data.role}</div>

    <nav class="mt-6 space-y-1 text-sm">
      <a class="block rounded px-2 py-1 hover:bg-slate-100" href="/t/{data.team.slug}/dashboard">Dashboard</a>
      <a class="block rounded px-2 py-1 hover:bg-slate-100" href="/t/{data.team.slug}/conferences">Conferences</a>
      <a class="block rounded px-2 py-1 hover:bg-slate-100" href="/t/{data.team.slug}/members">Members</a>
      <a class="block rounded px-2 py-1 hover:bg-slate-100" href="/t/{data.team.slug}/settings">Settings</a>
    </nav>
  </aside>
  <section>{@render children()}</section>
</div>
