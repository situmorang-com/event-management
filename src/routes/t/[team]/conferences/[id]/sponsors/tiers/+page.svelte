<script lang="ts">
  let { data, form } = $props();
</script>

<div class="flex items-center justify-between">
  <h2 class="text-lg font-semibold">Sponsor tiers</h2>
  <a class="btn-secondary" href="../sponsors">Back to sponsors</a>
</div>

{#if form?.saved}<p class="mt-3 text-sm text-green-700">Saved.</p>{/if}
{#if form?.deleted}<p class="mt-3 text-sm text-green-700">Deleted.</p>{/if}
{#if form?.error}<p class="mt-3 text-sm text-red-600">{form.error}</p>{/if}

<form method="POST" action="?/create" class="card mt-4 grid gap-3 sm:grid-cols-5">
  <label class="block sm:col-span-2">
    <span class="text-xs">Name</span>
    <input name="name" required class="input mt-1" placeholder="Platinum" />
  </label>
  <label class="block">
    <span class="text-xs">Rank</span>
    <input type="number" name="rank" required value="0" class="input mt-1" />
  </label>
  <label class="block">
    <span class="text-xs">Price ($)</span>
    <input type="number" step="0.01" name="price" class="input mt-1" />
  </label>
  <label class="block">
    <span class="text-xs">Color</span>
    <input name="color" placeholder="#888" class="input mt-1" />
  </label>
  <label class="block sm:col-span-5">
    <span class="text-xs">Benefits (one per line)</span>
    <textarea name="benefits" rows="2" class="input mt-1"></textarea>
  </label>
  <button class="btn-primary sm:col-span-5">Add tier</button>
</form>

<ul class="mt-6 space-y-2">
  {#each data.tiers as t}
    <li class="card">
      <form method="POST" action="?/update" class="grid gap-3 sm:grid-cols-5">
        <input type="hidden" name="id" value={t.id} />
        <label class="block sm:col-span-2">
          <span class="text-xs">Name</span>
          <input name="name" required class="input mt-1" value={t.name} />
        </label>
        <label class="block">
          <span class="text-xs">Rank</span>
          <input type="number" name="rank" required class="input mt-1" value={t.rank} />
        </label>
        <label class="block">
          <span class="text-xs">Price ($)</span>
          <input
            type="number"
            step="0.01"
            name="price"
            class="input mt-1"
            value={t.price != null ? (t.price / 100).toFixed(2) : ''}
          />
        </label>
        <label class="block">
          <span class="text-xs">Color</span>
          <input name="color" class="input mt-1" value={t.color ?? ''} />
        </label>
        <label class="block sm:col-span-5">
          <span class="text-xs">Benefits</span>
          <textarea name="benefits" rows="2" class="input mt-1">{t.benefits ?? ''}</textarea>
        </label>
        <div class="flex gap-2 sm:col-span-5">
          <button class="btn-secondary">Save</button>
          <button formaction="?/delete" class="btn-secondary text-red-600">Delete</button>
        </div>
      </form>
    </li>
  {:else}
    <li class="text-sm text-slate-500">No tiers yet.</li>
  {/each}
</ul>
