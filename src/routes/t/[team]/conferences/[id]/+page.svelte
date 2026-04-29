<script lang="ts">
  let { data } = $props();
</script>

<div class="grid gap-4 md:grid-cols-3">
  <div class="card">
    <div class="text-sm text-slate-500">Registered</div>
    <div class="mt-1 text-3xl font-semibold">—</div>
  </div>
  <div class="card">
    <div class="text-sm text-slate-500">Checked in</div>
    <div class="mt-1 text-3xl font-semibold">—</div>
  </div>
  <div class="card">
    <div class="text-sm text-slate-500">Capacity</div>
    <div class="mt-1 text-3xl font-semibold">{data.conference.capacity ?? '∞'}</div>
  </div>
</div>

<div class="card mt-6">
  <h2 class="font-semibold">Public registration</h2>
  <p class="mt-1 text-sm text-slate-600">
    Share this URL: <code>/e/{data.conference.slug}</code>
  </p>
</div>
