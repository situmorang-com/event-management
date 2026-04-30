<script lang="ts">
  let { data } = $props();
</script>

<div class="animate-fade-up">
  <h1 class="text-2xl font-semibold tracking-tight">Choose a team</h1>
  <p class="mt-1 text-sm text-ink-500">Pick a workspace to manage its conferences.</p>
</div>

<ul class="mt-8 grid gap-3 sm:grid-cols-2 stagger">
  {#each data.memberships as m}
    <li>
      <a
        class="card-interactive group flex items-center justify-between"
        href="/t/{m.teamSlug}/dashboard"
      >
        <div>
          <div class="font-medium tracking-tight">{m.teamName}</div>
          <div class="mt-0.5 text-xs uppercase tracking-wide text-ink-500">{m.role}</div>
        </div>
        <span
          class="text-ink-400 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-ink-900"
          aria-hidden="true"
        >→</span>
      </a>
    </li>
  {/each}
</ul>

<div class="mt-8 animate-fade-up [animation-delay:0.4s]">
  <a href="/teams/new" class="btn-secondary">+ Create new team</a>
</div>
