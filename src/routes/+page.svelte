<script lang="ts">
  let { data } = $props();
</script>

<section class="py-16 text-center">
  <h1 class="text-4xl font-bold tracking-tight">Run great conferences.</h1>
  <p class="mx-auto mt-4 max-w-2xl text-slate-600">
    Guest lists, free tickets, QR check-in, and sponsor management — without the bloat.
  </p>
  <div class="mt-8">
    {#if data.user}
      <a href="/dashboard" class="btn-primary">Open dashboard</a>
    {:else}
      <a href="/login" class="btn-primary">Get started</a>
    {/if}
  </div>
</section>
