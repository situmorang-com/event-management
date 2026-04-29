<script lang="ts">
  let { data } = $props();
</script>

<div class="mx-auto max-w-md">
  <div class="card text-center">
    <h1 class="text-xl font-semibold">{data.conference.name}</h1>
    <p class="mt-1 text-sm text-slate-500">
      {new Date(data.conference.startsAt).toLocaleString()}
    </p>
    <img class="mx-auto mt-6 h-72 w-72" src={data.ticket.qr} alt="QR code" />
    <div class="mt-4 font-mono text-lg tracking-wider">{data.ticket.code}</div>
    <div class="mt-2 text-sm">{data.ticket.name} · {data.ticket.status}</div>
  </div>
</div>
