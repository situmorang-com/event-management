<script lang="ts">
  import '../app.css';
  let { children, data } = $props();
</script>

<header class="border-b border-slate-200 bg-white">
  <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
    <a href="/" class="font-semibold">Event Management</a>
    <nav class="flex items-center gap-4 text-sm">
      {#if data?.user}
        <a href="/dashboard" class="hover:underline">Dashboard</a>
        <span class="text-slate-500">{data.user.email}</span>
        <form method="POST" action="/logout">
          <button class="hover:underline">Sign out</button>
        </form>
      {:else}
        <a href="/login" class="hover:underline">Sign in</a>
      {/if}
    </nav>
  </div>
</header>

<main class="mx-auto max-w-6xl px-4 py-8">
  {@render children()}
</main>
