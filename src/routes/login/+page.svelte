<script lang="ts">
  let { form } = $props();
</script>

<div class="mx-auto max-w-md">
  <div class="card">
    <h1 class="text-2xl font-semibold">Sign in</h1>
    <p class="mt-1 text-sm text-slate-600">We'll email you a magic link.</p>

    {#if form?.sent}
      <p class="mt-6 rounded-md bg-green-50 p-4 text-sm text-green-900">
        Check your inbox. The link expires in 15 minutes.
      </p>
    {:else}
      <form method="POST" class="mt-6 space-y-4">
        <label class="block">
          <span class="text-sm font-medium">Email</span>
          <input
            type="email"
            name="email"
            required
            autocomplete="email"
            class="input mt-1"
            value={form?.email ?? ''}
          />
        </label>
        {#if form?.error}
          <p class="text-sm text-red-600">{form.error}</p>
        {/if}
        <button type="submit" class="btn-primary w-full">Send magic link</button>
      </form>
    {/if}
  </div>
</div>
