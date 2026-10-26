<script lang="ts">
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';

	let {
		text,
		side = 'top',
		children
	}: {
		text: string;
		side?: 'top' | 'bottom';
		children: Snippet;
	} = $props();

	let open = $state(false);
	let bubble = $state<HTMLSpanElement | null>(null);
	let shift = $state(0);

	$effect(() => {
		if (!open || !bubble) return;

		// Keep the bubble inside the viewport by shifting it after it renders.
		const rect = bubble.getBoundingClientRect();
		const current = untrack(() => shift);
		const left = rect.left - current;
		const right = rect.right - current;
		const margin = 8;

		if (left < margin) shift = margin - left;
		else if (right > window.innerWidth - margin) shift = window.innerWidth - margin - right;
		else shift = 0;
	});
</script>

<span
	role="presentation"
	class="group relative inline-flex"
	onmouseenter={() => (open = true)}
	onmouseleave={() => (open = false)}
	onfocusin={() => (open = true)}
	onfocusout={(event) => {
		if (!event.currentTarget.contains(event.relatedTarget as Node | null)) open = false;
	}}
>
	{@render children()}
	<span
		bind:this={bubble}
		role="tooltip"
		class="pointer-events-none absolute left-1/2 z-30 w-max max-w-[calc(100vw-2rem)] rounded bg-ink px-2 py-1 text-[11px] text-white transition-opacity {open
			? 'opacity-100'
			: 'opacity-0'} {side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}"
		style:transform="translateX(calc(-50% + {shift}px))"
	>
		{text}
	</span>
</span>
