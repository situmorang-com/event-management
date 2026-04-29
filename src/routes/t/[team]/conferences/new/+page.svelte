<script lang="ts">
  let { form, data } = $props();
</script>

<h1 class="text-2xl font-semibold">New conference</h1>

<form method="POST" class="card mt-6 space-y-4">
  <label class="block">
    <span class="text-sm font-medium">Name</span>
    <input name="name" required class="input mt-1" value={form?.values?.name ?? ''} />
  </label>
  <label class="block">
    <span class="text-sm font-medium">Venue</span>
    <input name="venue" class="input mt-1" value={form?.values?.venue ?? ''} />
  </label>
  <div class="grid gap-4 sm:grid-cols-2">
    <label class="block">
      <span class="text-sm font-medium">Starts at</span>
      <input type="datetime-local" name="startsAt" required class="input mt-1" />
    </label>
    <label class="block">
      <span class="text-sm font-medium">Ends at</span>
      <input type="datetime-local" name="endsAt" required class="input mt-1" />
    </label>
  </div>
  <label class="block">
    <span class="text-sm font-medium">Capacity (optional)</span>
    <input type="number" name="capacity" min="1" class="input mt-1" />
  </label>
  <label class="block">
    <span class="text-sm font-medium">Description</span>
    <textarea name="description" rows="4" class="input mt-1"></textarea>
  </label>
  {#if form?.error}
    <p class="text-sm text-red-600">{form.error}</p>
  {/if}
  <div class="flex gap-2">
    <button class="btn-primary">Create</button>
    <a href="/t/{data.team.slug}/conferences" class="btn-secondary">Cancel</a>
  </div>
</form>
