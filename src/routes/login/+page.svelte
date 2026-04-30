<script lang="ts">
  let { form } = $props();
</script>

<div class="mx-auto max-w-md">
  <div class="card">
    <h1 class="text-2xl font-semibold">Sign in</h1>

    <div class="mt-6 space-y-4">
      <a href="/auth/oauth/google" class="btn btn-primary w-full flex items-center justify-center gap-2">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign in with Google
      </a>
    </div>

    <div class="relative mt-6">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-slate-300"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="bg-white px-2 text-slate-500">Or continue with email</span>
      </div>
    </div>

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
