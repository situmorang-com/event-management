<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  let { data } = $props();

  type Result =
    | { kind: 'ok'; name: string; company?: string | null }
    | { kind: 'already'; name: string; checkedInAt: string }
    | { kind: 'cancelled'; name: string }
    | { kind: 'unknown' }
    | { kind: 'error'; message: string };

  let result = $state<Result | null>(null);
  let manualCode = $state('');
  let scannerEl: HTMLDivElement;
  let scanner: { stop: () => Promise<void>; clear: () => void } | null = null;
  let lastCode = '';
  let lastAt = 0;

  async function submit(code: string) {
    if (!code) return;
    const now = Date.now();
    if (code === lastCode && now - lastAt < 2500) return;
    lastCode = code;
    lastAt = now;
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          code,
          teamSlug: data.team.slug,
          conferenceId: data.conference.id
        })
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        result = { kind: 'ok', name: json.name, company: json.company };
      } else if (json.reason === 'already') {
        result = { kind: 'already', name: json.name, checkedInAt: json.checkedInAt };
      } else if (json.reason === 'cancelled') {
        result = { kind: 'cancelled', name: json.name };
      } else if (json.reason === 'unknown') {
        result = { kind: 'unknown' };
      } else {
        result = { kind: 'error', message: json.message ?? 'Error' };
      }
    } catch (e) {
      result = { kind: 'error', message: (e as Error).message };
    }
  }

  onMount(async () => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    const { Html5Qrcode } = await import('html5-qrcode');
    const html5 = new Html5Qrcode('reader');
    scanner = {
      stop: () => html5.stop().catch(() => {}),
      clear: () => html5.clear()
    };
    try {
      await html5.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 240 },
        (decoded) => submit(decoded),
        () => {}
      );
    } catch (e) {
      result = { kind: 'error', message: 'Camera unavailable: ' + (e as Error).message };
    }
  });

  onDestroy(async () => {
    if (scanner) {
      await scanner.stop();
      scanner.clear();
    }
  });
</script>

<h2 class="text-lg font-semibold">Check-in</h2>
<p class="mt-1 text-sm text-slate-600">Point the camera at a ticket QR. HTTPS required on iOS.</p>

<div class="mt-4 grid gap-4 md:grid-cols-2">
  <div>
    <div id="reader" bind:this={scannerEl} class="overflow-hidden rounded-lg border border-slate-200 bg-black"></div>
    <form
      class="mt-3 flex gap-2"
      onsubmit={(e) => {
        e.preventDefault();
        submit(manualCode.trim());
        manualCode = '';
      }}
    >
      <input bind:value={manualCode} placeholder="or type code" class="input flex-1" />
      <button class="btn-secondary">Check</button>
    </form>
  </div>

  <div>
    {#if result?.kind === 'ok'}
      <div class="card border-green-300 bg-green-50">
        <div class="text-2xl font-semibold text-green-900">✓ Welcome, {result.name}</div>
        {#if result.company}<div class="text-sm text-green-900">{result.company}</div>{/if}
      </div>
    {:else if result?.kind === 'already'}
      <div class="card border-amber-300 bg-amber-50">
        <div class="text-xl font-semibold text-amber-900">Already checked in</div>
        <div class="text-sm">{result.name}</div>
        <div class="text-xs text-amber-800">at {new Date(result.checkedInAt).toLocaleTimeString()}</div>
      </div>
    {:else if result?.kind === 'cancelled'}
      <div class="card border-red-300 bg-red-50">
        <div class="text-xl font-semibold text-red-900">Cancelled ticket</div>
        <div class="text-sm">{result.name}</div>
      </div>
    {:else if result?.kind === 'unknown'}
      <div class="card border-red-300 bg-red-50">
        <div class="text-xl font-semibold text-red-900">Unknown ticket</div>
      </div>
    {:else if result?.kind === 'error'}
      <div class="card border-red-300 bg-red-50">
        <div class="text-sm text-red-900">{result.message}</div>
      </div>
    {:else}
      <div class="card text-slate-500">Awaiting scan…</div>
    {/if}
  </div>
</div>
