<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  let { children, data } = $props();
</script>

<header class="surface-glass sticky top-0 z-30">
  <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
    <a href="/" class="group flex items-center gap-2">
      <span
        class="grid h-7 w-7 place-items-center rounded-lg bg-ink-900 text-white shadow-lift transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-105"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M6 7v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7M9 4h6v3H9z" />
        </svg>
      </span>
      <span class="font-semibold tracking-tight">Event Management</span>
    </a>
    <nav class="flex items-center gap-1 text-sm">
      {#if data?.user}
        <a
          href="/dashboard"
          class="rounded-md px-3 py-1.5 transition-colors hover:bg-ink-100 hover:text-ink-900 {$page.url.pathname.startsWith('/dashboard') ? 'text-ink-900' : 'text-ink-700'}"
        >
          Dashboard
        </a>
        <span class="hidden text-ink-500 sm:inline-block px-2">·</span>
        <span class="hidden text-ink-500 sm:inline-block">{data.user.email}</span>
        <form method="POST" action="/logout">
          <button class="btn-ghost ml-1">Sign out</button>
        </form>
      {:else}
        <a href="/login" class="btn-ghost">Sign in</a>
      {/if}
    </nav>
  </div>
</header>

<main class="mx-auto max-w-6xl px-4 py-10 animate-fade-in">
  {@render children()}
</main>
