<script lang="ts">
  let { form } = $props();
</script>

<div class="mx-auto max-w-md">
  <div class="card">
    <h1 class="text-2xl font-semibold">Create a team</h1>
    <p class="mt-1 text-sm text-slate-600">
      Teams own conferences. You can invite collaborators later.
    </p>
    <form method="POST" class="mt-6 space-y-4">
      <label class="block">
        <span class="text-sm font-medium">Team name</span>
        <input name="name" required class="input mt-1" value={form?.name ?? ''} />
      </label>
      {#if form?.error}
        <p class="text-sm text-red-600">{form.error}</p>
      {/if}
      <button class="btn-primary w-full">Create team</button>
    </form>
  </div>
</div>
