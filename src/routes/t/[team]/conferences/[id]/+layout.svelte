<script lang="ts">
  import { page } from '$app/stores';
  let { children, data } = $props();
  const base = $derived(`/t/${data.team.slug}/conferences/${data.conference.id}`);

  function isActive(href: string) {
    const current = $page.url.pathname;
    if (href === base) return current === base;
    return current.startsWith(href);
  }
</script>

<div>
  <div class="flex items-baseline justify-between">
    <h1 class="text-2xl font-semibold">{data.conference.name}</h1>
    <span class="badge">{data.conference.status}</span>
  </div>

  <nav class="mt-6 flex gap-0 border-b border-ink-200 text-sm">
    {#each [
      { href: base, label: 'Overview' },
      { href: `${base}/guests`, label: 'Guests' },
      { href: `${base}/checkin`, label: 'Check-in' },
      { href: `${base}/sponsors`, label: 'Sponsors' },
      { href: `${base}/settings`, label: 'Settings' }
    ] as t}
      <a
        href={t.href}
        class="relative px-4 py-3 transition-colors duration-150
          {isActive(t.href)
            ? 'font-medium text-ink-900'
            : 'text-ink-500 hover:text-ink-700'}"
      >
        {t.label}
        {#if isActive(t.href)}
          <span
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-ink-900 to-ink-700"
            aria-hidden="true"
          ></span>
        {/if}
      </a>
    {/each}
  </nav>

  <div class="mt-8">{@render children()}</div>
</div>
