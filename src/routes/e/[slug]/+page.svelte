<script lang="ts">
  let { data } = $props();
</script>

<article class="mx-auto max-w-2xl">
  <h1 class="text-3xl font-bold">{data.conference.name}</h1>
  <p class="mt-2 text-slate-600">
    {new Date(data.conference.startsAt).toLocaleString()} — {data.conference.venue ?? 'TBA'}
  </p>
  {#if data.conference.description}
    <p class="mt-6 whitespace-pre-wrap">{data.conference.description}</p>
  {/if}

  <div class="card mt-8">
    <h2 class="font-semibold">Register</h2>
    <p class="mt-1 text-sm text-slate-600">Public registration form — TODO.</p>
  </div>

  {#if data.sponsors.length > 0}
    <section class="mt-12">
      <h2 class="text-xl font-semibold">Sponsors</h2>
      <ul class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {#each data.sponsors as s}
          <li class="card text-center">
            {#if s.websiteUrl}
              <a href={s.websiteUrl} rel="noopener noreferrer" target="_blank">{s.name}</a>
            {:else}
              {s.name}
            {/if}
          </li>
        {/each}
      </ul>
    </section>
  {/if}
</article>
