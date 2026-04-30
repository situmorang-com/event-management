<script lang="ts">
  let { data } = $props();
</script>

<section class="relative overflow-hidden py-20 text-center sm:py-28">
  <div
    aria-hidden="true"
    class="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]"
  >
    <div class="absolute left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-200/40 via-fuchsia-200/30 to-transparent blur-3xl"></div>
  </div>

  <div class="animate-fade-up [animation-delay:0.05s]">
    <span class="badge mb-6 shadow-soft">
      <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
      Now in beta
    </span>
  </div>

  <h1 class="gradient-text animate-fade-up text-5xl font-semibold tracking-tight sm:text-6xl [animation-delay:0.12s]">
    Run great conferences.
  </h1>
  <p class="mx-auto mt-5 max-w-2xl text-lg text-ink-500 animate-fade-up [animation-delay:0.2s]">
    Guest lists, free tickets, QR check-in, and sponsor management — without the bloat.
  </p>
  <div class="mt-10 flex items-center justify-center gap-3 animate-fade-up [animation-delay:0.28s]">
    {#if data.user}
      <a href="/dashboard" class="btn-primary">Open dashboard →</a>
    {:else}
      <a href="/login" class="btn-primary">Get started →</a>
      <a href="#features" class="btn-secondary">Learn more</a>
    {/if}
  </div>
</section>

<section id="features" class="grid gap-4 pb-16 sm:grid-cols-3 stagger">
  {#each [
    { t: 'Guest lists', d: 'Drag-drop CSV/vCard imports, search, statuses, WhatsApp invites.' },
    { t: 'QR check-in', d: 'Camera-based scanning at the door — fast and offline-friendly.' },
    { t: 'Sponsors', d: 'Track tiers, contacts, deliverables — all in one place.' }
  ] as f}
    <div class="card-interactive">
      <div class="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-ink-900 text-white shadow-soft">
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="m5 12 5 5L20 7" />
        </svg>
      </div>
      <h3 class="text-base font-semibold">{f.t}</h3>
      <p class="mt-1 text-sm text-ink-500">{f.d}</p>
    </div>
  {/each}
</section>
