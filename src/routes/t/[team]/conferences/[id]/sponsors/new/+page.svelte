<script lang="ts">
  import { page } from '$app/state';
  let { data, form } = $props();
  const initialKind = page.url.searchParams.get('kind') === 'vendor' ? 'vendor' : 'sponsor';
</script>

<h2 class="text-lg font-semibold">New {initialKind}</h2>

<form method="POST" class="card mt-4 grid gap-3 sm:grid-cols-2">
  <input type="hidden" name="kind" value={initialKind} />
  <label class="block sm:col-span-2">
    <span class="text-xs">Name</span>
    <input name="name" required class="input mt-1" />
  </label>
  <label class="block">
    <span class="text-xs">Website</span>
    <input type="url" name="websiteUrl" class="input mt-1" placeholder="https://" />
  </label>
  <label class="block">
    <span class="text-xs">Tier</span>
    <select name="tierId" class="input mt-1">
      <option value="">— none —</option>
      {#each data.tiers as t}<option value={t.id}>{t.name}</option>{/each}
    </select>
  </label>
  <label class="block">
    <span class="text-xs">Status</span>
    <select name="status" class="input mt-1">
      {#each ['prospect', 'invited', 'confirmed', 'paid', 'declined'] as s}
        <option value={s}>{s}</option>
      {/each}
    </select>
  </label>
  <label class="block">
    <span class="text-xs">Amount ($)</span>
    <input type="number" step="0.01" min="0" name="amount" class="input mt-1" />
  </label>
  <label class="block">
    <span class="text-xs">Contact name</span>
    <input name="contactName" class="input mt-1" />
  </label>
  <label class="block">
    <span class="text-xs">Contact email</span>
    <input type="email" name="contactEmail" class="input mt-1" />
  </label>
  <label class="block">
    <span class="text-xs">Contact WhatsApp</span>
    <input type="tel" name="contactWhatsapp" placeholder="+62 812 3456 7890" class="input mt-1" />
  </label>
  <label class="block sm:col-span-2">
    <span class="text-xs">Description</span>
    <textarea name="description" rows="3" class="input mt-1"></textarea>
  </label>
  <label class="block sm:col-span-2">
    <span class="text-xs">Internal notes</span>
    <textarea name="notes" rows="2" class="input mt-1"></textarea>
  </label>
  <label class="flex items-center gap-2 text-sm sm:col-span-2">
    <input type="checkbox" name="isPublic" checked /> Show on public sponsor wall
  </label>
  {#if form?.error}<p class="text-sm text-red-600 sm:col-span-2">{form.error}</p>{/if}
  <button class="btn-primary sm:col-span-2">Create</button>
</form>
