<script lang="ts">
	let {
		onDark = false,
		size = 'md'
	}: { onDark?: boolean; size?: 'sm' | 'md' | 'lg' } = $props();

	const kotak = {
		sm: 'h-7 w-7 rounded-md',
		md: 'h-9 w-9 rounded-lg',
		lg: 'h-12 w-12 rounded-xl'
	};
	const ikon = { sm: 14, md: 18, lg: 24 };
</script>

<div class="flex items-center gap-2">
	<span
		class="flex shrink-0 items-center justify-center {kotak[size]} {onDark
			? 'bg-cream'
			: 'bg-primary'}"
	>
		<svg viewBox="0 0 24 24" width={ikon[size]} height={ikon[size]} aria-hidden="true">
			<path
				class={onDark ? 'text-primary' : 'text-cream'}
				fill="currentColor"
				d="M6.5 7.5h11l1.2 12.5H5.3L6.5 7.5z"
			/>
			<path
				class={onDark ? 'text-primary' : 'text-cream'}
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				d="M9 9.5V6.2a3 3 0 0 1 6 0v3.3"
			/>
		</svg>
	</span>

	<span class="leading-tight">
		<b class="block text-[15px] font-bold {onDark ? 'text-white' : 'text-primary'}">TokoKu</b>
		<span
			class="block text-[9px] uppercase tracking-[0.18em] {onDark ? 'text-white/70' : 'text-muted'}"
		>
			Online Store
		</span>
	</span>
</div>
