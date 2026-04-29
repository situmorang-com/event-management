<script lang="ts">
  let { data, form } = $props();
</script>

<div class="mx-auto max-w-md">
  <div class="card">
    <h1 class="text-2xl font-semibold">Join {data.team.name}</h1>
    <p class="mt-2 text-sm text-slate-600">
      You've been invited as <strong>{data.invite.role}</strong>.
    </p>

    {#if !data.isSignedIn}
      <p class="mt-4 text-sm">
        Sign in with <strong>{data.invite.email}</strong> to accept.
      </p>
      {#if form?.sent}
        <p class="mt-3 rounded bg-green-50 p-3 text-sm text-green-900">
          Magic link sent. Check your inbox.
        </p>
      {:else}
        <form method="POST" action="?/signin" class="mt-3">
          <button class="btn-primary w-full">Email me a sign-in link</button>
        </form>
      {/if}
    {:else if !data.matchesEmail}
      <p class="mt-4 rounded bg-amber-50 p-3 text-sm text-amber-900">
        You're signed in with a different email. Sign out and use {data.invite.email}.
      </p>
      <form method="POST" action="/logout" class="mt-3">
        <button class="btn-secondary w-full">Sign out</button>
      </form>
    {:else}
      <form method="POST" action="?/accept" class="mt-4">
        <button class="btn-primary w-full">Accept invitation</button>
      </form>
    {/if}
  </div>
</div>
